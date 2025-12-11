import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def main():
    # Load environment variables from .env file
    load_dotenv()
    
    # Configure the Gemini API
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        api_key = input("Enter your Gemini API key: ")
    
    # Model fallback list
    available_models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-001",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite-001",
        "gemini-2.5-pro",
    ]
    current_model_index = 0
    
    # System instruction for Sri Lankan education tutor
    system_instruction = """You are Prasad K. Gamage - a dedicated educational tutor for Sri Lankan students.

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
    
    # Initialize LangChain LLM with first model
    print(f"🔧 Using model: {available_models[current_model_index]}")
    llm = ChatGoogleGenerativeAI(
        model=available_models[current_model_index],
        google_api_key=api_key,
        temperature=0.7,
        convert_system_message_to_human=True
    )
    
    # Create memory
    memory = ConversationBufferMemory(
        return_messages=True,
        memory_key="chat_history"
    )
    
    # Create prompt with system instruction
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    
    # Create conversation chain with LangChain
    conversation = ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False
    )
    
    print("=" * 70)
    print("Prasad K. Gamage - Learning Assistant for Sri Lankan Students 🇱🇰")
    print("Grades 1-13 | O/L & A/L | All Subjects")
    print("=" * 70)
    print("\nType 'quit' or 'exit' to end the session\n")
    
    while True:
        user_input = input("\nStudent: ").strip()
        
        if user_input.lower() in ['quit', 'exit']:
            print("\nKeep learning and stay curious! Good luck with your studies! 📚")
            break
        
        if not user_input:
            continue
        
        try:
            # Send message using LangChain conversation
            response = conversation.predict(input=user_input)
            print(f"\nPrasad K. Gamage: {response}")
        except Exception as e:
            error_msg = str(e)
            # Check for quota errors and try next model
            if "429" in error_msg or "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
                if current_model_index < len(available_models) - 1:
                    current_model_index += 1
                    print(f"\n⚠️ Quota exceeded! Switching to model: {available_models[current_model_index]}")
                    
                    # Recreate LLM and conversation with new model
                    llm = ChatGoogleGenerativeAI(
                        model=available_models[current_model_index],
                        google_api_key=api_key,
                        temperature=0.7,
                        convert_system_message_to_human=True
                    )
                    
                    # Recreate conversation with same memory
                    conversation = ConversationChain(
                        llm=llm,
                        memory=memory,
                        prompt=prompt,
                        verbose=False
                    )
                    
                    # Retry the request
                    try:
                        response = conversation.predict(input=user_input)
                        print(f"\nPrasad K. Gamage: {response}")
                    except Exception as retry_error:
                        print(f"\n❌ Error: {retry_error}")
                else:
                    print(f"\n❌ All models exhausted! Please wait for quota reset.\n{error_msg}")
            else:
                print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
