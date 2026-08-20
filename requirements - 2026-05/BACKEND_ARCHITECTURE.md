# Backend Architecture: Local Ollama Chat Frontend

**Document**: Backend Technical Design  
**Status**: Architecture Phase (Ready for Implementation)  
**Framework**: Flask (Python 3.8+)  
**Date**: May 9, 2026

---

## Overview

The Flask backend serves three primary functions:

1. **Static File Server**: Serve HTML/CSS/JavaScript frontend
2. **CORS Proxy**: Forward chat requests to Ollama (handling browser CORS restrictions)
3. **File Generator**: Create downloadable files from markdown code blocks

The backend is **stateless in v1** (no database, no sessions). All state lives in the browser's localStorage. This keeps v1 shipping fast and sets up a clean migration path to stateful v2.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Flask Backend                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Request Router                                           │   │
│  │  - GET  /              → serve index.html               │   │
│  │  - GET  /static/*      → serve CSS/JS                   │   │
│  │  - GET  /api/models    → proxy to Ollama                │   │
│  │  - POST /api/chat      → proxy to Ollama                │   │
│  │  - POST /api/download  → generate & stream file         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ollama Proxy Handler                                    │   │
│  │  - Forward requests with proper headers                  │   │
│  │  - Add CORS headers to response                          │   │
│  │  - Handle timeout/connection errors                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  File Handler                                            │   │
│  │  - Parse file content                                    │   │
│  │  - Validate file size (max 10MB)                         │   │
│  │  - Generate Content-Disposition headers                  │   │
│  │  - Stream response                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────────────────┐
                │  Ollama API           │
                │  localhost:11434      │
                └───────────────────────┘
```

---

## File Structure

```
local-ollama-chat/
├── server.py                      # Main Flask app (entry point)
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
├── config.py                      # Configuration (ports, timeouts, etc.)
├── handlers/
│   ├── __init__.py
│   ├── ollama_proxy.py           # Proxy logic for Ollama requests
│   ├── file_handler.py           # File generation & download logic
│   └── error_handler.py          # Centralized error handling
├── static/
│   ├── index.html                # Main frontend HTML
│   ├── style.css                 # Styling
│   ├── app.js                    # Frontend JavaScript
│   └── lib/
│       ├── marked.min.js         # Markdown parser (CDN or local)
│       └── highlight.min.js      # Syntax highlighter (CDN or local)
├── tests/                        # Unit tests (optional for v1, add in v2)
├── .gitignore
├── README.md                      # Setup & run instructions
└── BACKEND_ARCHITECTURE.md       # This file
```

---

## Core Components

### 1. Main Application (`server.py`)

**Responsibilities:**
- Flask app initialization
- Route registration
- CORS configuration
- Request/response logging
- Graceful shutdown

**Pseudo-code structure:**
```python
from flask import Flask
from handlers.ollama_proxy import ollama_bp
from handlers.file_handler import file_bp
from handlers.error_handler import setup_error_handlers

app = Flask(__name__, static_folder='static', static_url_path='/')

# Configuration
app.config['OLLAMA_HOST'] = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
app.config['OLLAMA_TIMEOUT'] = int(os.getenv('OLLAMA_TIMEOUT', 120))
app.config['MAX_FILE_SIZE'] = 10 * 1024 * 1024  # 10MB

# CORS headers (allow localhost only in v1)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # v1: local-only, OK
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Register blueprints
app.register_blueprint(ollama_bp)
app.register_blueprint(file_bp)

# Error handlers
setup_error_handlers(app)

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=False)
```

---

### 2. Ollama Proxy Handler (`handlers/ollama_proxy.py`)

**Responsibilities:**
- Forward `/api/models` and `/api/chat` requests to Ollama
- Handle timeouts and connection errors
- Log requests/responses for debugging

**Endpoints:**

#### `GET /api/models`
Fetches available models from Ollama.

```
Request: GET /api/models
  
Response (200): 
{
  "models": [
    { "name": "llama2", "size": 3826519424, "modified_at": "2024-01-20T..." },
    { "name": "mistral", "size": 4109000000, "modified_at": "2024-01-15T..." }
  ]
}

Error (502): 
{
  "error": "Ollama unavailable",
  "details": "Connection refused on localhost:11434"
}
```

**Implementation:**
```python
@ollama_bp.route('/api/models', methods=['GET'])
def get_models():
    """Proxy GET request to Ollama /api/tags endpoint."""
    try:
        response = requests.get(
            f'{OLLAMA_HOST}/api/tags',
            timeout=OLLAMA_TIMEOUT
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ollama unavailable"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama timeout"}), 504
```

---

#### `POST /api/chat`
Sends a message to Ollama and returns the full response (request-response only, no streaming in v1).

```
Request: POST /api/chat
Content-Type: application/json

{
  "model": "llama2",
  "messages": [
    { "role": "user", "content": "Write a Python function to sum two numbers" }
  ],
  "stream": false
}

Response (200):
{
  "model": "llama2",
  "created_at": "2026-05-09T...",
  "message": {
    "role": "assistant",
    "content": "Here's a Python function:\n\n```python\ndef sum_numbers(a, b):\n    return a + b\n```"
  },
  "done": true,
  "total_duration": 1234567890,
  "load_duration": 123456789,
  "prompt_eval_count": 15,
  "eval_count": 42,
  "eval_duration": 987654321
}

Error (400): { "error": "Invalid request" }
Error (502): { "error": "Ollama unavailable" }
Error (504): { "error": "Ollama timeout (took > 120 seconds)" }
```

**Implementation:**
```python
@ollama_bp.route('/api/chat', methods=['POST'])
def chat():
    """Proxy POST request to Ollama /api/chat endpoint."""
    try:
        payload = request.json
        
        # Validate request
        if not payload.get('model') or not payload.get('messages'):
            return jsonify({"error": "Missing model or messages"}), 400
        
        # Forward to Ollama (force stream=false for v1)
        payload['stream'] = False
        
        response = requests.post(
            f'{OLLAMA_HOST}/api/chat',
            json=payload,
            timeout=app.config['OLLAMA_TIMEOUT']
        )
        response.raise_for_status()
        
        return jsonify(response.json()), 200
    
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ollama unavailable"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama timeout"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

### 3. File Handler (`handlers/file_handler.py`)

**Responsibilities:**
- Validate file content (size limit)
- Generate downloadable files
- Stream response to browser
- Handle errors gracefully

**Endpoint:**

#### `POST /api/download`
Generates a file from provided content and streams it to the browser.

```
Request: POST /api/download
Content-Type: application/json

{
  "content": "function hello() { console.log('Hi'); }",
  "filename": "hello.js"
}

Response (200): 
  [File stream]
  Headers:
    Content-Disposition: attachment; filename="hello.js"
    Content-Type: text/javascript
    Content-Length: 45

Error (400): { "error": "Missing content or filename" }
Error (413): { "error": "File too large (max 10MB)" }
```

**Implementation:**
```python
from io import BytesIO

@file_bp.route('/api/download', methods=['POST'])
def download():
    """Generate and stream file download."""
    try:
        payload = request.json
        content = payload.get('content', '')
        filename = payload.get('filename', 'download.txt')
        
        # Validate
        if not content or not filename:
            return jsonify({"error": "Missing content or filename"}), 400
        
        # Check size (10MB limit)
        content_size = len(content.encode('utf-8'))
        if content_size > app.config['MAX_FILE_SIZE']:
            return jsonify({"error": f"File too large ({content_size} bytes > 10MB)"}), 413
        
        # Generate file
        file_stream = BytesIO(content.encode('utf-8'))
        
        # Determine MIME type from filename
        mime_type = get_mime_type(filename)
        
        # Stream to browser
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=filename,
            mimetype=mime_type
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_mime_type(filename):
    """Map file extensions to MIME types."""
    mime_map = {
        '.js': 'text/javascript',
        '.py': 'text/x-python',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.html': 'text/html',
        '.css': 'text/css',
        '.sh': 'text/x-shellscript',
    }
    ext = os.path.splitext(filename)[1].lower()
    return mime_map.get(ext, 'text/plain')
```

---

### 4. Error Handler (`handlers/error_handler.py`)

**Responsibilities:**
- Centralized error responses
- Consistent error format
- Logging

**Standard Error Response Format:**
```json
{
  "error": "Human-readable error message",
  "code": "error_code (e.g., CONNECTION_REFUSED, TIMEOUT)",
  "timestamp": "2026-05-09T12:34:56Z"
}
```

**Implementation:**
```python
def setup_error_handlers(app):
    """Register global error handlers."""
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"Server error: {e}")
        return jsonify({"error": "Server error"}), 500
    
    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405
```

---

### 5. Configuration (`config.py`)

```python
import os

class Config:
    """Base configuration."""
    OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
    OLLAMA_TIMEOUT = int(os.getenv('OLLAMA_TIMEOUT', 120))
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_HOST = os.getenv('FLASK_HOST', 'localhost')
    DEBUG = os.getenv('FLASK_DEBUG', False)

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

---

## Request/Response Flow

### Flow: User sends chat message

```
1. Frontend sends:
   POST /api/chat
   { "model": "llama2", "messages": [...] }

2. Backend receives request
   ├─ Validates JSON
   ├─ Ensures "stream": false
   └─ Forwards to Ollama

3. Ollama processes
   └─ Returns full response

4. Backend receives Ollama response
   ├─ Extracts assistant message
   ├─ Adds CORS headers
   └─ Returns to frontend

5. Frontend receives
   ├─ Parses JSON
   ├─ Renders markdown
   ├─ Extracts code blocks for download buttons
   └─ Displays in chat
```

### Flow: User downloads a code block

```
1. Frontend sends:
   POST /api/download
   { "content": "...", "filename": "hello.js" }

2. Backend receives request
   ├─ Validates content & filename
   ├─ Checks file size (< 10MB)
   ├─ Determines MIME type
   └─ Streams file to browser

3. Browser receives
   ├─ Content-Disposition: attachment
   └─ Saves to Downloads folder
```

---

## Dependencies

### Python Packages

```
flask==2.3.0                # Web framework
requests==2.31.0           # HTTP client for Ollama API
python-dotenv==1.0.0       # Environment variable management
gunicorn==21.0.0           # Production WSGI server (v2+)
```

**For testing (optional in v1):**
```
pytest==7.4.0
pytest-flask==1.2.0
```

**Install:** `pip install -r requirements.txt`

---

## Deployment & Running

### Development

```bash
# Install dependencies
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Set environment (optional)
export OLLAMA_HOST=http://localhost:11434
export FLASK_PORT=5000

# Run server
python server.py
```

Server runs on `http://localhost:5000`

### Production (v2+)

```bash
gunicorn --bind 0.0.0.0:5000 server:app
```

---

## Testing Strategy (v1)

**Manual Testing:**
- ✅ Fetch models from Ollama
- ✅ Send chat message and receive response
- ✅ Download individual code blocks
- ✅ Test file size limit (try uploading > 10MB)
- ✅ Test error handling (kill Ollama, verify error messages)

**Automated Testing (Optional for v1, recommended for v2):**
- Unit tests for file handler (size validation, MIME type detection)
- Integration tests for proxy endpoints (mock Ollama, verify forwarding)
- See `tests/` directory structure below

---

## Logging & Debugging

**What to log:**
- Request method, path, response code
- Ollama connection errors
- File download events
- Exceptions with stack traces

**Enable debug logging:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## Security Considerations (v1)

### What's NOT a concern in v1 (single-user, local-only)
- ❌ User authentication
- ❌ CSRF protection (no state-changing ops)
- ❌ Rate limiting (single user)
- ❌ Input sanitization (trust local Ollama)

### What IS in scope for v1
- ✅ File size limits (prevent unbounded downloads)
- ✅ Timeout handling (prevent hanging requests)
- ✅ Error messages that don't leak internals

### Security Rework for v2+
- Authentication & session management
- Input validation & sanitization
- Rate limiting per user
- Conversation access control
- File storage permissions

---

## Rework Notes for v2 (Multi-User)

1. **Add Database Layer**
   - Replace stateless design with SQLite/PostgreSQL
   - Schema: users, conversations, messages, files
   - Implement session/JWT authentication

2. **Streaming Support**
   - Use Flask streaming responses
   - Frontend: listen to SSE or WebSocket
   - Render tokens as they arrive

3. **File Storage**
   - Store files on disk or cloud storage (not browser Downloads)
   - Implement access control
   - Add file metadata & retention policies

4. **Multi-Conversation Support**
   - Separate conversation threads per user
   - Conversation naming/tagging
   - Query multiple conversations

5. **Production Deployment**
   - Use gunicorn + nginx reverse proxy
   - Environment-based configuration
   - Logging to files/cloud
   - Health checks & monitoring

---

## Implementation Checklist

Use this to track backend implementation progress:

### Phase 1: Foundation
- [ ] Create project structure (directories, files)
- [ ] Set up Flask app with configuration
- [ ] Create requirements.txt with dependencies
- [ ] Create .env.example template
- [ ] Set up .gitignore

### Phase 2: Static File Serving
- [ ] Implement GET / → serve index.html
- [ ] Implement GET /static/* → serve CSS/JS
- [ ] Test static files load in browser

### Phase 3: Ollama Proxy
- [ ] Implement GET /api/models endpoint
  - [ ] Test: fetch models from local Ollama
  - [ ] Test: handle Ollama timeout (> 120 sec)
  - [ ] Test: handle Ollama connection error
- [ ] Implement POST /api/chat endpoint
  - [ ] Test: send message, receive response
  - [ ] Test: force stream=false in payload
  - [ ] Test: handle malformed requests (missing fields)
  - [ ] Test: handle Ollama timeout

### Phase 4: File Download Handler
- [ ] Implement POST /api/download endpoint
  - [ ] Test: download text file
  - [ ] Test: download code file (.js, .py, .md)
  - [ ] Test: file size validation (10MB limit)
  - [ ] Test: reject files > 10MB
  - [ ] Test: MIME type detection
  - [ ] Test: missing filename/content

### Phase 5: Error Handling
- [ ] Implement centralized error handler
  - [ ] Test: 404 errors
  - [ ] Test: 400 (bad request)
  - [ ] Test: 502 (Ollama unavailable)
  - [ ] Test: 504 (Ollama timeout)
  - [ ] Test: 413 (file too large)
  - [ ] Verify error messages are helpful

### Phase 6: CORS & Headers
- [ ] Add CORS headers to all responses
- [ ] Test cross-origin requests from frontend
- [ ] Verify Content-Type headers are correct
- [ ] Test Content-Disposition for downloads

### Phase 7: Documentation & Cleanup
- [ ] Write README.md with setup instructions
- [ ] Add inline code comments
- [ ] Update requirements.txt with exact versions
- [ ] Test full end-to-end flow
  - [ ] Load frontend
  - [ ] Select model
  - [ ] Send message
  - [ ] View response
  - [ ] Download code block

### Phase 8: Testing (Optional for v1, Recommended)
- [ ] Write unit tests for file handler
- [ ] Write integration tests for proxy endpoints
- [ ] Create mock Ollama server for testing
- [ ] Achieve > 80% code coverage

### Phase 9: Deployment Prep (v2+)
- [ ] Test with gunicorn
- [ ] Create systemd service file (optional)
- [ ] Document environment variables for production
- [ ] Add health check endpoint

---

## Common Pitfalls & How to Avoid Them

| Pitfall | How to Avoid |
|---------|-------------|
| CORS errors when frontend calls backend | Always include `Access-Control-Allow-*` headers in responses |
| Streaming responses when stream=false expected | Explicitly set `stream: false` in payload before forwarding |
| File downloads with wrong MIME type | Use `get_mime_type()` helper to map extensions |
| Hanging requests if Ollama times out | Always set timeout (120s) on requests.post() calls |
| Hard-coded localhost in code | Use environment variables (OLLAMA_HOST) |
| Missing error handling for edge cases | Test with Ollama off, network errors, oversized files |

---

## Next Steps

1. Start with **Phase 1: Foundation** to set up project structure
2. Implement **Phase 2-3** to verify Ollama connection works
3. Iterate through phases 4-6 for core functionality
4. Phase 7 for documentation before v1 release
5. Phases 8-9 for v2 (multi-user, streaming, etc.)

---

**Questions or blockers?** Reference this document as a specification for implementation.
