# Product Requirements Document: Local Ollama Chat Frontend

**Product Name:** Local Ollama Chat Frontend  
**Version:** 1.0 (MVP)  
**Last Updated:** May 9, 2026  
**Author/Stakeholder:** Dean Sakihama  
**Status:** MVP Planning Phase

---

## Problem Statement

Running Ollama from the terminal is functional but cumbersome. Users need a lightweight, browser-based chat interface to interact with local LLM instances without copy-pasting between windows. The interface should render responses as formatted markdown (with syntax highlighting for code blocks) and allow easy export of generated code/documents.

## Goals & Success Criteria

### MVP Success (v1)
1. ✅ Send message to local Ollama instance and receive response
2. ✅ Responses render as markdown with syntax highlighting
3. ✅ Download individual code/document blocks from responses (smart file type detection)
4. ✅ Switch between locally installed models
5. ✅ Chat history persists during browser session (localStorage)
6. ✅ Clear chat history with one click
7. ✅ Responsive, feels snappy (<1 second from clicking "send" to response appearing)

### Non-Goals for v1
- Real-time streaming (show tokens as they arrive)
- Full conversation export/save
- Multi-user support or authentication
- Mobile responsiveness
- Persistent conversation storage (backend database)

---

## Scope

### In Scope (v1)
- Single-user, local-only interface
- Chat with any model installed in local Ollama
- Model selection dropdown (fetches available models on page load)
- Model switching (starts new chat when switching)
- Request-response interaction (send → wait for full response → display)
- Download individual code blocks with smart file type detection (based on markdown fence hints)
- File size limit: 10MB per download
- Markdown rendering + syntax highlighting for code blocks
- Chat history stored in browser localStorage
- Clear history button
- Copy response functionality
- Error handling for Ollama connection failures
- Loading indicator while waiting for response

### Out of Scope (v1)
- Real-time token streaming
- Full conversation export as JSON/markdown file
- Conversation persistence (backend storage)
- User authentication or multi-user session management
- File security/permissions model
- Character count display
- Message timestamps
- Mobile-responsive design (desktop-first)
- Conversation bookmarking or search
- Custom model parameters (temperature, top_p, etc.)
- System prompts or prompt templates

---

## Users & Personas

**Primary User (v1):** Developer/Researcher (Solo)
- Uses local Ollama for code generation, documentation, research
- Wants fast iteration without terminal friction
- Will switch between multiple models as needed
- Needs to export generated code/documents to files

**Future User (v2+):** Small team sharing a single Ollama instance
- Multiple users accessing the same backend
- Need conversation isolation and session management
- Possible file/artifact storage on server

---

## Technical Architecture

### Technology Stack

**Backend (Python)**
- Framework: Flask (lightweight, minimal)
- Purpose:
  - Serve static frontend files (HTML/CSS/JS)
  - Proxy requests to Ollama (handles CORS)
  - Generate and stream file downloads
  - Placeholder for future session/user management

**Frontend (HTML/CSS/JavaScript)**
- No build step, no framework (ship fast)
- Libraries (loaded from CDN):
  - `marked.js` - Markdown parsing
  - `highlight.js` - Code syntax highlighting
  - Native Fetch API - HTTP requests
  - Native `localStorage` - Session chat history

**External Dependency**
- Ollama (running locally, default port 11434)

### File Structure

```
local-ollama-chat/
├── server.py                    # Flask backend
├── requirements.txt             # Python dependencies
├── static/
│   ├── index.html              # Main HTML
│   ├── style.css               # Styling
│   ├── app.js                  # Frontend logic
│   └── lib/
│       ├── marked.min.js       # Markdown parser (CDN)
│       └── highlight.min.js    # Syntax highlighting (CDN)
├── .gitignore
├── README.md                    # Setup instructions
└── PRD.md                       # This file
```

### Data Flow

```
User Input
    ↓
Frontend (HTML/JS)
    ↓ (Fetch)
Backend Proxy (Flask)
    ↓ (HTTP)
Ollama API (localhost:11434)
    ↓ (Response)
Backend Proxy (Flask)
    ↓ (JSON)
Frontend (app.js)
    ↓
Markdown Renderer + Syntax Highlighter
    ↓
Chat Window (Display)
```

---

## Core Features

### 1. Chat Interface
- **Input Area**: Text input field + "Send" button
- **Message Display**: Alternating user/assistant messages
- **Model Selection**: Dropdown fetching models from `/api/tags` on page load
  - Displays model names dynamically
  - Switching models starts a new chat (clears history)
  - Selected model persisted to localStorage
- **Clear History**: Button to wipe chat and start fresh
- **Copy Response**: One-click copy button for entire message text

### 2. Response Rendering
- All responses rendered as markdown (via `marked.js`)
- Code blocks get syntax highlighting (via `highlight.js`)
- Code blocks include individual **Download** buttons
  - Smart detection: parse markdown fence hints (```js, ```python, etc.)
  - Fallback: ask user for file extension if hint unclear
  - 10MB file size limit
  - Browser downloads to user's Downloads folder

### 3. Message Management
- Chat history stored in `localStorage` (key: `chatHistory`)
- Persists across browser refreshes, cleared only by user action
- Each message stores: { role, content, timestamp (for display), modelUsed }
- Max history size: not limited (v2 will add persistence and cleanup)

### 4. Error Handling
- Connection failure to Ollama → user-friendly error message
- Ollama timeout → display message + auto-retry option
- Malformed response → log to console, show fallback text
- File download > 10MB → reject with message

### 5. Loading & UX
- Loading spinner while waiting for response
- Auto-scroll to latest message
- Disable send button while response pending
- Visual feedback for copy/download actions

---

## API Integration

### Ollama Endpoints Used

```
GET /api/tags
  Response: { "models": [ { "name": "...", "size": ..., "modified_at": "..." } ] }
  
POST /api/chat
  Request: { "model": "model-name", "messages": [...], "stream": false }
  Response: { "message": { "role": "assistant", "content": "..." }, ... }
```

### Backend Proxy Endpoints

The Flask server will expose:

```
GET /
  → Serve index.html

GET /api/models
  → Proxy to Ollama's /api/tags, return list of available models

POST /api/chat
  → Proxy to Ollama's /api/chat, return full response (no streaming)

POST /api/download
  → Generate file from provided content, stream to browser
  → Request: { "content": "...", "filename": "..." }
  → Response: File download (Content-Disposition: attachment)
```

---

## Non-Functional Requirements

### Performance
- **Response Display**: Sub-1 second from user sending message to response appearing in chat
  - Excludes Ollama's inference time (depends on model/hardware)
  - Measures: network latency + markdown rendering + DOM updates
- **Page Load**: Static files cached, first load < 2 seconds
- **Model Dropdown**: Populate in < 500ms

### Scalability
- v1: Single browser tab, single user
- v2+: See rework notes below

### Availability
- Graceful degradation if Ollama is unavailable
- Retry logic for transient connection failures

### Security (v1: Minimal)
- No authentication or authorization (single-user, local-only)
- CSRF protection: not needed (no state-changing operations, local-only)
- Input validation: frontend sanitization of user input before sending to Ollama
- File downloads: validate file size (10MB limit) before streaming

---

## Constraints

### v1 Constraints
- **Time**: Ship MVP in < 2 weeks
- **Scope**: Single-user, request-response only (no streaming)
- **Dependencies**: Minimal (Flask, marked.js, highlight.js)
- **Platform**: Local machine only (no cloud deployment)

### Assumptions
- Ollama is running on localhost:11434
- User's browser supports ES6 and Fetch API
- User can install Python 3.8+ and Flask
- CORS is not configured in Ollama (we handle via proxy)

---

## Rework Points for Multi-User (v2+)

**These are not in v1 scope, but document what will need refactoring when multi-user lands:**

### 1. Streaming Responses (v2)
- **Current (v1)**: Request-response only
- **Future (v2)**: Real-time token streaming from Ollama
- **Rework**: 
  - Backend: proxy streaming responses (chunk encoding)
  - Frontend: render tokens as they arrive instead of waiting for full response
  - UI: show "thinking..." indicator while streaming

### 2. Persistent Conversation Storage (v2)
- **Current (v1)**: localStorage only (ephemeral, browser-specific)
- **Future (v2)**: Backend database (SQLite or similar)
- **Rework**:
  - Add database schema for conversations & messages
  - Backend endpoints: GET /conversations, POST /conversations/{id}/messages
  - Frontend: load conversation history from API instead of localStorage
  - Consider encryption for conversation content

### 3. Session & User Management (v2)
- **Current (v1)**: No sessions (single-user, always "logged in")
- **Future (v2)**: Session tokens, user authentication
- **Rework**:
  - Add user table + session management
  - Implement login/logout (or use OS auth if on company network)
  - Associate conversations with users
  - Handle session cleanup/expiry

### 4. File Storage & Access Model (v2+)
- **Current (v1)**: Downloads go to user's local Downloads folder
- **Future (v2)**: Files stored on server, users can access/share
- **Rework**:
  - Add file storage backend (disk or cloud)
  - Implement access control (who can view/download which files)
  - Add file metadata (owner, created_at, permissions)
  - Consider retention policy (auto-delete old files?)

### 5. Conversation Isolation (v2)
- **Current (v1)**: One active chat, switch models = new chat (clear history)
- **Future (v2)**: Multiple concurrent conversations, separate threads per model
- **Rework**:
  - Frontend: conversation selector/sidebar (like ChatGPT threads)
  - Backend: store multiple conversation contexts
  - Consider conversation naming/tagging

### 6. Ollama Model Parameters (v2)
- **Current (v1)**: Use Ollama defaults (no parameter control)
- **Future (v2)**: Allow users to set temperature, top_p, max_tokens, etc.
- **Rework**:
  - Frontend: sliders/inputs for model parameters
  - Backend: pass parameters through to Ollama API

---

## Dependencies & Blockers

### Must-Have (Blocking v1)
- Python 3.8+ installed on local machine
- Ollama running on localhost:11434
- Modern browser (Chrome, Firefox, Safari, Edge)

### Nice-to-Have (v1)
- None identified yet

### Known Risks
- Ollama API breaking changes (mitigated: Ollama is stable, unlikely in v1 timeframe)
- Large model responses (> 10MB) will be rejected (by design, can expand limit in v2)

---

## Open Questions & Decisions

### Resolved ✅
- ✅ Request-response only (no streaming in v1)
- ✅ Model switching starts new chat
- ✅ File downloads via individual code block buttons
- ✅ 10MB file size limit
- ✅ Python + Flask backend
- ✅ Markdown code fence detection (fallback: ask user)

### Pending
- None at this time (see Rework Points for v2+ decisions)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-09 | Single-user v1, designed for multi-user v2+ | Ship fast now, architecture prepared for growth |
| 2026-05-09 | Python Flask backend (not Node.js) | User preference, lightweight, maintainable |
| 2026-05-09 | Plain HTML/JS (not Vue.js) | Faster shipping, fewer dependencies, still maintainable with clear code |
| 2026-05-09 | Request-response only (no streaming) | Simpler implementation, ships faster, streaming deferred to v2 |
| 2026-05-09 | Model switching → new chat | Clear UX, avoids context confusion, simpler implementation |
| 2026-05-09 | File downloads via markdown code blocks | Smart, intuitive, aligns with user workflow |
| 2026-05-09 | 10MB file size limit | Prevent unbounded generation, reasonable for text/code v1 |
| 2026-05-09 | localStorage for chat history (v1 only) | Fast to implement, sufficient for single-user session |
| 2026-05-09 | Security model deferred to v2/v3 | Single-user local-only doesn't require auth/encryption now |

---

## Next Steps

1. **Architect Backend** (Flask structure, Ollama proxy, file download logic)
2. **Design Frontend** (HTML/CSS layout, JavaScript state management)
3. **Implement & Test** (connect to local Ollama, test all core features)
4. **Documentation** (README with setup instructions)
5. **v2 Planning** (multi-user architecture, streaming, persistence)

---

## Appendix: Success Metrics Tracking

### Metrics to Monitor in v1
- **Shipping**: Time to working MVP
- **Performance**: Response display time (target: < 1 second)
- **Reliability**: Ollama connection stability, error handling
- **UX**: Does model switching behavior feel right? File download success rate?

### Metrics for v2+
- Multi-user session isolation, conversation persistence, streaming performance
- (To be defined in v2 PRD)

---

## Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-05-09 | Dean Sakihama | Initial MVP PRD with rework notes for v2+ |
