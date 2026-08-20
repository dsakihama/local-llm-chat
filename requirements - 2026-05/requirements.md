# Local Ollama Chat Frontend - Requirements  
  
## Project Overview  
Build a lightweight locally-hosted web interface for chatting with a locally-running Ollama LLM instance. The frontend communicates with Ollama's API to provide an interactive chat experience.  
  
## Purpose  
- Provide a user-friendly chat interface for local LLM interaction  
- Replace terminal window interaction with a web-based GUI  
- Display model responses as formatted markdown for easy copying  
- Run entirely on the local machine without external dependencies  
  
## Technical Stack  
  
### Frontend (Lightweight Options)  
- **Framework**: Vue.js 3 (lightweight, ~35KB) OR plain HTML/CSS/JavaScript  
- **Styling**: Tailwind CSS (utility-first, minimal build) or plain CSS  
- **Markdown Rendering**: `marked.js` (lightweight markdown parser) + `highlight.js` (syntax highlighting)  
- **HTTP Client**: Fetch API (native browser support)  
  
### Backend Requirements  
- **Ollama**: Already running locally (expected on default port 11434)  
- **API Integration**: Use Ollama REST API endpoints  
  - Chat endpoint: `POST /api/chat`  
  - Models list endpoint: `GET /api/tags`  
- **Local Server**: Lightweight Python (Flask) or Node.js (Express) to serve static files and handle CORS  
  
### Development Environment  
- Python 3.8+ OR Node.js 14+ (for local dev server)  
- Browser: Modern browser with ES6 support (Chrome, Firefox, Safari, Edge)  
  
## Core Features  
  
### Chat Interface  
- **Input Area**: Text input field for user messages with send button  
- **Message Display**: Chat history showing alternating user/assistant messages  
- **Markdown Rendering**: All model responses rendered as formatted markdown  
- **Copy Functionality**: One-click copy button for entire responses or code blocks  
- **Model Selection**: Dropdown to select which local model to use  
  - Fetches available models from `/api/models` endpoint on page load  
  - Displays model names dynamically from Ollama's installed models  
  - Allows switching models mid-conversation  
  - Persists selected model choice to localStorage  
- **Clear History**: Button to clear chat history  
  
### User Experience  
- Real-time message streaming (if Ollama supports chunked responses)  
- Loading indicator while waiting for model response  
- Responsive layout (works on desktop at minimum)  
- Auto-scroll to latest message  
- Character count display for input (optional)  
- Timestamp on messages (optional)  
  
### Technical Requirements  
- **CORS Handling**: Server-side proxy to handle Ollama requests (avoid browser CORS issues)  
- **Session Management**: Store chat history in browser `localStorage`  
- **Error Handling**: Display user-friendly messages for API errors, connection failures  
- **Performance**: Goal of sub-500ms first response time for model queries  
  
## API Integration with Ollama  
  
### Endpoints to Use  
```  
GET /api/models                         # List available installed models  
GET /api/tags                           # (Internal) List available models from Ollama  
POST /api/chat                          # Send chat message and get response  
POST /api/pull {name: "model-name"}    # Pull a model (optional)  
```  
  
### Get Models Endpoint (Frontend calls this)  
```json  
GET /api/models  
Response:  
{  
  "models": [    {      "name": "llama2",      "size": 3826519424,      "modified_at": "2024-01-20T10:00:00Z"    },    {      "name": "mistral",      "size": 4109000000,      "modified_at": "2024-01-15T14:30:00Z"    }  ]}  
```  
  
### Chat Request Format  
```json  
{  
  "model": "model-name",  "messages": [    {"role": "user", "content": "message"}  ],  "stream": false}  
```  
  
## Deployment  
- **Local Hosting**: Simple Python Flask/Node.js server  
- **Port**: Configurable (default: 5000 for Python, 3000 for Node)  
- **Ollama Port**: Assumed 11434 (Ollama default)  
- **Auto-start**: Optional systemd service or startup script  
- **Logging**: Console logs for debugging  
  
## File Structure (Recommended)  
```  
local-ollama/  
├── requirements.md (this file)  
├── server.py (Flask backend) OR server.js (Node backend)  
├── static/  
│   ├── index.html  
│   ├── style.css  
│   ├── app.js  
│   └── lib/  
│       ├── marked.js (markdown parser)  
│       └── highlight.js (syntax highlighting)  
└── README.md (setup instructions)  
```  
  
## Dependencies Summary  
  
### Python Backend (if using Flask)  
- `flask` - Web framework  
- `flask-cors` - CORS handling  
- `requests` - HTTP client for Ollama API  
  
### Node.js Backend (if using Express)  
- `express` - Web framework  
- `cors` - CORS middleware  
- `axios` - HTTP client for Ollama API  
  
### Frontend  
- `marked` - Markdown parsing  
- `highlight.js` - Code syntax highlighting  
- `modern browser` - Native Fetch API, localStorage  
  
## Non-Requirements  
- Database (localStorage only)  
- User authentication  
- Multi-user support  
- Mobile responsiveness (desktop-first)  
- External API calls  
- Build process (plain JS/HTML preferred initially)  
  
## Success Criteria  
1. Can send message to local Ollama instance  
2. Receives and displays response in chat window  
3. Response rendered as markdown with proper formatting  
4. Can copy response text easily  
5. Chat history persists during browser session  
6. Responsive interface that feels snappy (<1 second response display)