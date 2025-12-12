from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from typing import List, Optional
import time
from datetime import date

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

# Security imports
from security import message_validator, prompt_guard, rate_limiter

# Database and Authentication imports
from database import get_db, create_tables, test_connection, User
from auth import (
    UserRegister, UserLogin, Token, UserResponse,
    register_user, authenticate_user, get_current_user,
    create_access_token
)

# Load environment variables
load_dotenv()

# Configure API key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Initialize FastAPI app
app = FastAPI(
    title="Prasad K Gamage AI Assistant API",
    version="2.0.0",
    description="LangChain & LangGraph powered AI assistant"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System instruction for Prasad K Gamage persona
SYSTEM_INSTRUCTION = """You are Prasad K. Gamage - a dedicated educational tutor for Sri Lankan students.

CRITICAL IDENTITY RULES:
- You ARE Prasad K. Gamage, a knowledgeable teacher (NOT an AI/bot/assistant/model)
- When asked "who are you?", "what are you?", "who am I talking to?", ALWAYS respond: "I'm Prasad K. Gamage, your learning assistant"
- NEVER mention being artificial intelligence, AI, chatbot, language model, or assistant
- NEVER use phrases like "I'm an AI" or "As an AI"

YOUR ROLE AS AN EDUCATIONAL TUTOR:
- Help Sri Lankan students from Grade 1 to Grade 13 (including O/L and A/L students)
- Provide clear explanations for all subjects: Mathematics, Science, Sinhala, English, Tamil, History, Geography, ICT, Commerce, and more
- Explain concepts in simple, student-friendly language appropriate for their grade level and age
- Support learning in Sinhala, English, and Tamil medium as needed
- Help with homework, exam preparation, and understanding difficult topics
- Provide step-by-step solutions with clear reasoning
- Encourage critical thinking and problem-solving skills
- Be patient, supportive, and motivating

SRI LANKAN CURRICULUM KNOWLEDGE:
- Understand the Sri Lankan education system structure
- Familiar with O/L (Ordinary Level) and A/L (Advanced Level) examinations
- Know common syllabi and textbooks used in Sri Lankan schools
- Adapt teaching style based on student's grade level and age

COMMUNICATION STYLE:
- **PRIMARY LANGUAGE RULE**: Always respond in the student's registered preferred language
- **LANGUAGE DETECTION**: If the student asks a question in a different language than their registered language, respond in that language for that specific message
- **LANGUAGE SWITCHING**: If student explicitly requests language change ("speak in English", "Tamil පேසு", etc.), switch to that language
- **ADDRESSING STUDENTS**: 
  * Use their first name naturally in conversation
  * When being affectionate or encouraging, call them:
    - In English: "son" (for males) or "daughter" (for females)
    - In Sinhala: "පුතා" (for males) or "දුව" (for females)
    - In Tamil: "மகன்" (for males) or "மகள்" (for females)
- Be friendly, patient, and encouraging
- Use age-appropriate language for the student's grade level
- Provide clear, step-by-step explanations
- Use examples relevant to Sri Lankan context
- Ask questions to check understanding
- Provide visual descriptions when helpful
- Encourage students and build their confidence
- Use markdown formatting for better readability
- Show worked examples for mathematical and scientific problems"""

# In-memory storage for chat sessions using LangChain
chat_sessions = {}

# Model fallback list - will try models in order when quota is exceeded
AVAILABLE_MODELS = [
    "gemini-2.5-flash",           # Primary: Latest stable flash model
    "gemini-2.0-flash-001",       # Fallback 1: Stable 2.0 flash
    "gemini-flash-latest",        # Fallback 2: Always latest flash
    "gemini-2.5-flash-lite",      # Fallback 3: Lighter version
    "gemini-2.0-flash-lite-001",  # Fallback 4: Lite stable version
    "gemini-2.5-pro",             # Fallback 5: More capable (may have lower quota)
]

# Track current model index
current_model_index = 0

# Initialize LangChain LLM with current model
def get_llm():
    global current_model_index
    model_name = AVAILABLE_MODELS[current_model_index]
    print(f"Using model: {model_name}")
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.7,
        convert_system_message_to_human=True
    )

# Switch to next available model
def switch_to_next_model():
    global current_model_index
    if current_model_index < len(AVAILABLE_MODELS) - 1:
        current_model_index += 1
        print(f"⚠️ Quota exceeded! Switching to model: {AVAILABLE_MODELS[current_model_index]}")
        return True
    else:
        print("❌ All models exhausted!")
        return False

# Pydantic models with validation
class ChatMessage(BaseModel):
    """User message with validation"""
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    
    @field_validator('message')
    @classmethod
    def validate_message_content(cls, v):
        """Validate and sanitize message"""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()

class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None
    model_used: Optional[str] = None

class ChatHistory(BaseModel):
    role: str
    text: str
    timestamp: Optional[float] = None

class SessionResponse(BaseModel):
    session_id: str
    history: List[ChatHistory]
    message_count: int = 0

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Prasad K. Gamage - Sri Lankan Students Learning Assistant API",
        "version": "2.0.0",
        "description": "Educational support for Sri Lankan students Grade 1-13",
        "endpoints": {
            "POST /auth/register": "Register a new user",
            "POST /auth/login": "Login and get access token",
            "GET /auth/me": "Get current user info (requires auth)",
            "POST /chat": "Send a message (stateless)",
            "POST /chat/session": "Create a new chat session",
            "POST /chat/session/{session_id}": "Send message in a session",
            "GET /chat/session/{session_id}": "Get session history",
            "DELETE /chat/session/{session_id}": "Delete a session"
        }
    }

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - **first_name**: First name
    - **last_name**: Last name
    - **email**: Valid email address
    - **phone_number**: Phone number (10+ digits)
    - **grade_level**: Grade level (1-12)
    - **language**: Preferred language (Sinhala, English, Tamil)
    - **password**: Password (minimum 6 characters)
    - **confirm_password**: Confirm password
    """
    try:
        new_user = register_user(user_data, db)
        return new_user
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login and receive access token
    
    - **email**: Your email address
    - **password**: Your password
    
    Returns JWT access token for authenticated requests
    """
    try:
        user = authenticate_user(user_data.email, user_data.password, db)
        
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email}
        )
        
        return Token(
            access_token=access_token,
            user_id=user.id,
            username=f"{user.first_name} {user.last_name}",
            email=user.email
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information
    
    Requires: Bearer token in Authorization header
    """
    return current_user

# ==================== CHAT ENDPOINTS ====================

@app.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Send a single message without maintaining session history (uses LangChain)
    Automatically switches models if quota is exceeded
    Includes security validation and sanitization
    Requires authentication to personalize responses
    """
    # Step 1: Rate limiting
    client_ip = request.client.host
    is_allowed, limit_reason = rate_limiter.check_rate_limit(client_ip)
    if not is_allowed:
        raise HTTPException(status_code=429, detail=limit_reason)
    
    # Step 2: Validate and sanitize message
    is_valid, sanitized_message, error_reason = message_validator.validate_message(message.message)
    if not is_valid:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid message: {error_reason}"
        )
    
    # Step 3: Wrap message with prompt guard
    guarded_message = prompt_guard.wrap_user_message(sanitized_message)
    
    # Step 4: Calculate age from birthday
    today = date.today()
    age = today.year - current_user.birthday.year - ((today.month, today.day) < (current_user.birthday.month, current_user.birthday.day))
    
    # Determine son/daughter based on gender
    child_term = "son" if current_user.gender == "Male" else "daughter"
    child_term_si = "පුතා" if current_user.gender == "Male" else "දුව"
    child_term_ta = "மகன்" if current_user.gender == "Male" else "மகள்"
    
    # Step 5: Create personalized system instruction with user data
    personalized_instruction = f"""
{SYSTEM_INSTRUCTION}

STUDENT CONTEXT:
- Name: {current_user.first_name} {current_user.last_name}
- Age: {age} years old (calculated from birthday)
- Gender: {current_user.gender}
- Grade Level: Grade {current_user.grade_level}
- Registered Preferred Language: {current_user.language}

CRITICAL LANGUAGE RULES:
1. **DEFAULT LANGUAGE**: Always respond in {current_user.language} (the student's registered language)
2. **LANGUAGE DETECTION**: If the student's question is clearly in a different language (English/Sinhala/Tamil), respond in THAT language for that message
3. **EXAMPLE**: If registered language is Sinhala but student asks "What is photosynthesis?", respond in English
4. **EXAMPLE**: If registered language is English but student asks "ප්‍රභාසංශ්ලේෂණය මොකක්ද?", respond in Sinhala

PERSONALIZED ADDRESSING:
1. Use the student's first name: {current_user.first_name}
2. Call them affectionately based on their gender ({current_user.gender}):
   - In English: "{child_term}"
   - In Sinhala: "{child_term_si}"
   - In Tamil: "{child_term_ta}"
3. Example greetings:
   - English: "Hi {current_user.first_name}!" or "Good question, {child_term}!"
   - Sinhala: "හායි {current_user.first_name}!" or "හොඳ ප්‍රශ්නයක්, {child_term_si}!"
   - Tamil: "வணக்கம் {current_user.first_name}!" or "நல்ல கேள்வி, {child_term_ta}!"

CONTENT ADAPTATION:
1. Tailor explanations for a {age}-year-old in Grade {current_user.grade_level}
2. Match difficulty to Grade {current_user.grade_level} Sri Lankan curriculum
3. Use age-appropriate examples and language
4. Be encouraging and supportive
5. Make learning enjoyable and build confidence
"""
    
    max_retries = len(AVAILABLE_MODELS)
    
    for attempt in range(max_retries):
        try:
            llm = get_llm()
            messages = [
                SystemMessage(content=personalized_instruction),
                HumanMessage(content=guarded_message)
            ]
            response = llm.invoke(messages)
            
            # Step 4: Validate response
            is_safe, validated_response = prompt_guard.validate_response(response.content)
            if not is_safe:
                raise HTTPException(status_code=500, detail="Response validation failed")
            
            return ChatResponse(
                response=validated_response,
                session_id=f"stateless",
                model_used=AVAILABLE_MODELS[current_model_index]
            )
        except Exception as e:
            error_msg = str(e)
            # Check if it's a quota error (429)
            if "429" in error_msg or "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
                if switch_to_next_model():
                    continue  # Retry with next model
                else:
                    raise HTTPException(
                        status_code=429,
                        detail=f"All models exhausted. Please wait for quota reset."
                    )
            else:
                # Other errors
                raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Failed after all retry attempts")

@app.post("/chat/session", response_model=SessionResponse)
async def create_session(current_user: User = Depends(get_current_user)):
    """
    Create a new chat session with LangChain memory
    Requires authentication to personalize chat
    """
    import uuid
    session_id = str(uuid.uuid4())
    
    # Calculate age from birthday
    today = date.today()
    age = today.year - current_user.birthday.year - ((today.month, today.day) < (current_user.birthday.month, current_user.birthday.day))
    
    # Determine son/daughter based on gender
    child_term = "son" if current_user.gender == "Male" else "daughter"
    child_term_si = "පුතා" if current_user.gender == "Male" else "දුව"
    child_term_ta = "மகன்" if current_user.gender == "Male" else "மகள்"
    
    # Create personalized system instruction
    personalized_instruction = f"""
{SYSTEM_INSTRUCTION}

STUDENT CONTEXT:
- Name: {current_user.first_name} {current_user.last_name}
- Age: {age} years old (calculated from birthday)
- Gender: {current_user.gender}
- Grade Level: Grade {current_user.grade_level}
- Registered Preferred Language: {current_user.language}

CRITICAL LANGUAGE RULES:
1. **DEFAULT LANGUAGE**: Always respond in {current_user.language} (the student's registered language)
2. **LANGUAGE DETECTION**: If the student's question is clearly in a different language (English/Sinhala/Tamil), respond in THAT language for that message
3. **EXAMPLE**: If registered language is Sinhala but student asks "What is photosynthesis?", respond in English
4. **EXAMPLE**: If registered language is English but student asks "ප්‍රභාසංශ්ලේෂණය මොකක්ද?", respond in Sinhala

PERSONALIZED ADDRESSING:
1. Use the student's first name: {current_user.first_name}
2. Call them affectionately based on their gender ({current_user.gender}):
   - In English: "{child_term}"
   - In Sinhala: "{child_term_si}"
   - In Tamil: "{child_term_ta}"
3. Example greetings:
   - English: "Hi {current_user.first_name}!" or "Good question, {child_term}!"
   - Sinhala: "හායි {current_user.first_name}!" or "හොඳ ප්‍රශ්නයක්, {child_term_si}!"
   - Tamil: "வணக்கம் {current_user.first_name}!" or "நல்ல கேள்வி, {child_term_ta}!"

CONTENT ADAPTATION:
1. Tailor explanations for a {age}-year-old in Grade {current_user.grade_level}
2. Match difficulty to Grade {current_user.grade_level} Sri Lankan curriculum
3. Use age-appropriate examples and language
4. Be encouraging and supportive
5. Make learning enjoyable and build confidence
"""
    
    # Create LangChain conversation with memory
    llm = get_llm()
    memory = ConversationBufferMemory(
        return_messages=True,
        memory_key="chat_history"
    )
    
    # Create prompt template with personalized system message
    prompt = ChatPromptTemplate.from_messages([
        ("system", personalized_instruction),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    
    # Create conversation chain
    chain = ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False
    )
    
    chat_sessions[session_id] = {
        "chain": chain,
        "memory": memory
    }
    
    return SessionResponse(
        session_id=session_id,
        history=[]
    )

@app.post("/chat/session/{session_id}", response_model=ChatResponse)
async def chat_with_session(
    session_id: str, 
    message: ChatMessage, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Send a message within an existing chat session (LangChain powered)
    Automatically switches models and recreates session if quota is exceeded
    Includes security validation and sanitization
    Requires authentication for personalized responses
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Step 1: Rate limiting
    is_allowed, limit_reason = rate_limiter.check_rate_limit(session_id)
    if not is_allowed:
        raise HTTPException(status_code=429, detail=limit_reason)
    
    # Step 2: Validate and sanitize message
    is_valid, sanitized_message, error_reason = message_validator.validate_message(message.message)
    if not is_valid:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid message: {error_reason}"
        )
    
    # Step 3: Check session message limit
    session = chat_sessions[session_id]
    if len(session["memory"].chat_memory.messages) >= 100:
        raise HTTPException(
            status_code=400, 
            detail="Session message limit reached (100 messages). Please create a new session."
        )
    
    # Step 4: Calculate age and prepare personalized data for potential session recreation
    today = date.today()
    age = today.year - current_user.birthday.year - ((today.month, today.day) < (current_user.birthday.month, current_user.birthday.day))
    
    # Determine son/daughter based on gender
    child_term = "son" if current_user.gender == "Male" else "daughter"
    child_term_si = "පුතා" if current_user.gender == "Male" else "දුව"
    child_term_ta = "மகன்" if current_user.gender == "Male" else "மகள்"
    
    # Create personalized system instruction
    personalized_instruction = f"""
{SYSTEM_INSTRUCTION}

STUDENT CONTEXT:
- Name: {current_user.first_name} {current_user.last_name}
- Age: {age} years old (calculated from birthday)
- Gender: {current_user.gender}
- Grade Level: Grade {current_user.grade_level}
- Registered Preferred Language: {current_user.language}

CRITICAL LANGUAGE RULES:
1. **DEFAULT LANGUAGE**: Always respond in {current_user.language} (the student's registered language)
2. **LANGUAGE DETECTION**: If the student's question is clearly in a different language (English/Sinhala/Tamil), respond in THAT language for that message
3. **EXAMPLE**: If registered language is Sinhala but student asks "What is photosynthesis?", respond in English
4. **EXAMPLE**: If registered language is English but student asks "ප්‍රභාසංශ්ලේෂණය මොකක්ද?", respond in Sinhala

PERSONALIZED ADDRESSING:
1. Use the student's first name: {current_user.first_name}
2. Call them affectionately based on their gender ({current_user.gender}):
   - In English: "{child_term}"
   - In Sinhala: "{child_term_si}"
   - In Tamil: "{child_term_ta}"
3. Example greetings:
   - English: "Hi {current_user.first_name}!" or "Good question, {child_term}!"
   - Sinhala: "හායි {current_user.first_name}!" or "හොඳ ප්‍රශ්නයක්, {child_term_si}!"
   - Tamil: "வணக்கம் {current_user.first_name}!" or "நல்ல கேள்வி, {child_term_ta}!"

CONTENT ADAPTATION:
1. Tailor explanations for a {age}-year-old in Grade {current_user.grade_level}
2. Match difficulty to Grade {current_user.grade_level} Sri Lankan curriculum
3. Use age-appropriate examples and language
4. Be encouraging and supportive
5. Make learning enjoyable and build confidence
"""
    
    max_retries = len(AVAILABLE_MODELS)
    
    for attempt in range(max_retries):
        try:
            session = chat_sessions[session_id]
            chain = session["chain"]
            
            # Use LangChain to process message with memory
            response = chain.predict(input=sanitized_message)
            
            # Validate response
            is_safe, validated_response = prompt_guard.validate_response(response)
            if not is_safe:
                raise HTTPException(status_code=500, detail="Response validation failed")
            
            return ChatResponse(
                response=validated_response,
                session_id=session_id,
                model_used=AVAILABLE_MODELS[current_model_index]
            )
        except Exception as e:
            error_msg = str(e)
            # Check if it's a quota error (429)
            if "429" in error_msg or "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
                if switch_to_next_model():
                    # Recreate the session chain with new model and personalized instruction
                    session = chat_sessions[session_id]
                    old_memory = session["memory"]
                    
                    llm = get_llm()
                    prompt = ChatPromptTemplate.from_messages([
                        ("system", personalized_instruction),
                        MessagesPlaceholder(variable_name="chat_history"),
                        ("human", "{input}")
                    ])
                    
                    chain = ConversationChain(
                        llm=llm,
                        memory=old_memory,  # Keep the same memory
                        prompt=prompt,
                        verbose=False
                    )
                    
                    chat_sessions[session_id]["chain"] = chain
                    continue  # Retry with new model
                else:
                    raise HTTPException(
                        status_code=429,
                        detail=f"All models exhausted. Please wait for quota reset."
                    )
            else:
                # Other errors
                raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Failed after all retry attempts")

@app.get("/chat/session/{session_id}", response_model=SessionResponse)
async def get_session_history(session_id: str):
    """
    Get the chat history for a session (from LangChain memory)
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = chat_sessions[session_id]
    memory = session["memory"]
    
    # Get messages from LangChain memory
    messages = memory.chat_memory.messages
    history = []
    
    for msg in messages:
        role = "user" if isinstance(msg, HumanMessage) else "assistant"
        history.append(ChatHistory(
            role=role,
            text=msg.content,
            timestamp=time.time()
        ))
    
    return SessionResponse(
        session_id=session_id,
        history=history,
        message_count=len(history)
    )

@app.delete("/chat/session/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a chat session
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del chat_sessions[session_id]
    return {"message": f"Session {session_id} deleted successfully"}

@app.get("/models")
async def get_models_info():
    """Get information about current and available models"""
    return {
        "current_model": AVAILABLE_MODELS[current_model_index],
        "current_index": current_model_index,
        "available_models": AVAILABLE_MODELS,
        "remaining_fallbacks": len(AVAILABLE_MODELS) - current_model_index - 1
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "current_model": AVAILABLE_MODELS[current_model_index]
    }

if __name__ == "__main__":
    import uvicorn
    
    # Initialize database
    print("🔧 Initializing database...")
    if test_connection():
        create_tables()
    else:
        print("⚠️  Database connection failed. Authentication features may not work.")
    
    print("🚀 Starting server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
