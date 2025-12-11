from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import List, Optional

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

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
- Explain concepts in simple, student-friendly language appropriate for their grade level
- Support learning in Sinhala, English, and Tamil medium as needed
- Help with homework, exam preparation, and understanding difficult topics
- Provide step-by-step solutions with clear reasoning
- Encourage critical thinking and problem-solving skills
- Be patient, supportive, and motivating

SRI LANKAN CURRICULUM KNOWLEDGE:
- Understand the Sri Lankan education system structure
- Familiar with O/L (Ordinary Level) and A/L (Advanced Level) examinations
- Know common syllabi and textbooks used in Sri Lankan schools
- Adapt teaching style based on student's grade level

COMMUNICATION STYLE:
- **ALWAYS respond in Sinhala language by default** unless the user specifically asks for English or Tamil
- If user requests "chat in English" or "speak English", switch to English for that conversation
- If user requests "chat in Tamil" or "speak Tamil", switch to Tamil for that conversation
- Address students warmly as "daughter" (දුව/மகள்) or "son" (පුතා/மகன்) based on context
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

# Pydantic models
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None

class ChatHistory(BaseModel):
    role: str
    text: str

class SessionResponse(BaseModel):
    session_id: str
    history: List[ChatHistory]

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Prasad K. Gamage - Sri Lankan Students Learning Assistant API",
        "version": "2.0.0",
        "description": "Educational support for Sri Lankan students Grade 1-13",
        "endpoints": {
            "POST /chat": "Send a message (stateless)",
            "POST /chat/session": "Create a new chat session",
            "POST /chat/session/{session_id}": "Send message in a session",
            "GET /chat/session/{session_id}": "Get session history",
            "DELETE /chat/session/{session_id}": "Delete a session"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Send a single message without maintaining session history (uses LangChain)
    Automatically switches models if quota is exceeded
    """
    max_retries = len(AVAILABLE_MODELS)
    
    for attempt in range(max_retries):
        try:
            llm = get_llm()
            messages = [
                SystemMessage(content=SYSTEM_INSTRUCTION),
                HumanMessage(content=message.message)
            ]
            response = llm.invoke(messages)
            return ChatResponse(
                response=response.content,
                session_id=f"model:{AVAILABLE_MODELS[current_model_index]}"
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
                        detail=f"All models exhausted. Please wait for quota reset. Last error: {error_msg}"
                    )
            else:
                # Other errors
                raise HTTPException(status_code=500, detail=error_msg)
    
    raise HTTPException(status_code=500, detail="Failed after all retry attempts")

@app.post("/chat/session", response_model=SessionResponse)
async def create_session():
    """
    Create a new chat session with LangChain memory
    """
    import uuid
    session_id = str(uuid.uuid4())
    
    # Create LangChain conversation with memory
    llm = get_llm()
    memory = ConversationBufferMemory(
        return_messages=True,
        memory_key="chat_history"
    )
    
    # Create prompt template with system message
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_INSTRUCTION),
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
async def chat_with_session(session_id: str, message: ChatMessage):
    """
    Send a message within an existing chat session (LangChain powered)
    Automatically switches models and recreates session if quota is exceeded
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    max_retries = len(AVAILABLE_MODELS)
    
    for attempt in range(max_retries):
        try:
            session = chat_sessions[session_id]
            chain = session["chain"]
            
            # Use LangChain to process message with memory
            response = chain.predict(input=message.message)
            
            return ChatResponse(
                response=response,
                session_id=session_id
            )
        except Exception as e:
            error_msg = str(e)
            # Check if it's a quota error (429)
            if "429" in error_msg or "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
                if switch_to_next_model():
                    # Recreate the session chain with new model
                    session = chat_sessions[session_id]
                    old_memory = session["memory"]
                    
                    llm = get_llm()
                    prompt = ChatPromptTemplate.from_messages([
                        ("system", SYSTEM_INSTRUCTION),
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
                        detail=f"All models exhausted. Please wait for quota reset. Last error: {error_msg}"
                    )
            else:
                # Other errors
                raise HTTPException(status_code=500, detail=error_msg)
    
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
            text=msg.content
        ))
    
    return SessionResponse(
        session_id=session_id,
        history=history
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
