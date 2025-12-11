# Prasad K. Gamage - Sri Lankan Students Learning Assistant 🇱🇰

An AI-powered learning assistant designed specifically for Sri Lankan students from Grade 1 to Grade 13, including O/L and A/L students.

## Features

✅ **Comprehensive Subject Support**
- Mathematics
- Science (Biology, Physics, Chemistry)
- Languages (Sinhala, English, Tamil)
- History & Geography
- ICT & Computer Science
- Commerce & Accounting
- And all other subjects in the Sri Lankan curriculum

✅ **Multi-Language Support**
- Sinhala Medium
- English Medium
- Tamil Medium

✅ **Grade-Specific Help**
- Primary Education (Grade 1-5)
- Junior Secondary (Grade 6-9)
- O/L Preparation (Grade 10-11)
- A/L Preparation (Grade 12-13)

✅ **Advanced Features**
- LangChain & LangGraph powered for better memory
- Session-based learning (remembers previous conversations)
- Step-by-step problem solving
- Code syntax highlighting
- Markdown formatting for clear explanations
- Exam preparation support

## Project Structure

```
f:\my\
├── backend/              # Backend API and CLI
│   ├── api_server.py    # FastAPI REST API server
│   └── chat_assistant_cli.py  # Command-line interface
├── frontend/            # Web interface
│   └── index.html       # Chat web application
├── scripts/             # Utility scripts
│   └── check_models.py  # Check available Gemini models
├── .env                 # API key configuration
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── start_server.bat    # Quick start API server (Windows)
└── start_cli.bat       # Quick start CLI (Windows)
```

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure API Key
Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the Application

**Quick Start (Windows):**
- Double-click `start_server.bat` to start API server
- Or double-click `start_cli.bat` for command-line version

**Manual Start:**

**Option 1: Web Interface (Recommended)**
```bash
python backend/api_server.py
```
Then open `frontend/index.html` in your web browser.

**Option 2: Command Line Interface**
```bash
python backend/chat_assistant_cli.py
```

**Option 3: Check Available Models**
```bash
python scripts/check_models.py
```

## Usage Examples

### For Mathematics
```
Student: Can you help me solve this quadratic equation: x² + 5x + 6 = 0
```

### For Science
```
Student: What is photosynthesis? Explain it in simple terms for Grade 7
```

### For Language Learning
```
Student: Can you explain the difference between simple past and past continuous in English?
```

### For O/L Preparation
```
Student: I'm preparing for O/L Mathematics. Can you give me tips on solving algebra problems?
```

### For A/L Preparation
```
Student: I'm studying for A/L Combined Mathematics. Can you help me with calculus?
```

## API Endpoints

### Web API (http://localhost:8000)

- `POST /chat` - Send a single message (stateless)
- `POST /chat/session` - Create a new learning session
- `POST /chat/session/{session_id}` - Send message in a session
- `GET /chat/session/{session_id}` - Get session history
- `DELETE /chat/session/{session_id}` - Delete a session
- `GET /health` - Health check

## Technology Stack

- **Backend**: FastAPI + LangChain + LangGraph
- **AI Model**: Google Gemini (6-model automatic fallback)
- **Frontend**: HTML5, CSS3, JavaScript
- **Features**: Markdown rendering, Syntax highlighting
- **Memory**: LangChain ConversationBufferMemory
- **Security**: Input validation, prompt injection detection, rate limiting

## Security Features

🔒 **Comprehensive Protection**
- **Input Validation**: HTML escaping, length checks, sanitization
- **Prompt Injection Detection**: 10+ attack pattern detection
- **SQL/Command Injection**: Blocks malicious database and system commands
- **Rate Limiting**: 20 requests/minute, 100 requests/hour per session
- **Response Validation**: Prevents system information leakage
- **Content Safety**: Multi-layer filtering for safe interactions

See [backend/SECURITY.md](backend/SECURITY.md) for detailed security documentation.

**Test Security**: Run `python scripts/test_security.py` to verify all protections.

## For Students

This learning assistant is designed to:
- Help you understand difficult concepts
- Provide step-by-step solutions
- Prepare for exams (O/L, A/L)
- Support homework and assignments
- Explain in your preferred language
- Build confidence in learning

## Important Notes

- This is a learning aid, not a replacement for teachers
- Always verify important information with textbooks
- Use this tool to enhance your understanding
- Practice problems on your own after learning

## Support

For any issues or suggestions, please create an issue in the repository.

---

**Good luck with your studies! 📚🎓**

**ඔබේ අධ්‍යාපනයට සාර්ථකත්වය අත් වේවා! 📚**

**உங்கள் படிப்பிற்கு வெற்றி வாழ்த்துக்கள்! 📚**
