# Frontend Architecture: Local Ollama Chat Frontend

**Document**: Frontend Technical Design  
**Status**: Architecture Phase (Ready for Implementation)  
**Framework**: Plain HTML/CSS/JavaScript (no build step)  
**Date**: May 9, 2026

---

## Overview

The frontend is a single-page application (SPA) with **no build process, no framework**. All code is vanilla JavaScript—this keeps it fast to ship and easy to debug.

**Core Responsibilities:**
1. **Display Chat Interface** — Messages, input, model selector
2. **Handle User Interactions** — Send messages, clear history, switch models, download files
3. **Render Responses** — Parse markdown, syntax highlight code blocks
4. **Manage Local State** — Chat history in localStorage, UI state in memory
5. **Call Backend** — Fetch API for all HTTP requests

---

## UI Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│                     LOCAL OLLAMA CHAT FRONTEND                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                         HEADER                               │  │
│  │  Title: "Ollama Chat"                                        │  │
│  │  Model Selector: [dropdown v]                               │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      CHAT WINDOW                             │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ [You]  →  Message text here...                         │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ [Assistant]  →  Response text rendered as markdown    │ │  │
│  │  │                                                        │ │  │
│  │  │  ```js                                                │ │  │
│  │  │  function hello() { console.log('hi'); }  [Download]  │ │  │
│  │  │  ```                                                  │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  [Loading spinner (hidden when idle)]                        │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     INPUT & CONTROLS                         │  │
│  │                                                              │  │
│  │  <textarea placeholder="Your message..."></textarea>        │  │
│  │  [Send]  [Clear History]  [Copy Last Response]             │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

The frontend is organized into **6 logical components** (not React components, just mental models):

### 1. **Header** (`#header`)
**Responsibility**: Display title and model selector

**Contents:**
- App title: "Ollama Chat"
- Model dropdown: fetches available models on page load
- Currently selected model display

**HTML Structure:**
```html
<header id="header">
  <h1>Ollama Chat</h1>
  <div id="model-selector">
    <label for="model-dropdown">Model:</label>
    <select id="model-dropdown">
      <option>Loading models...</option>
    </select>
  </div>
</header>
```

**JavaScript Responsibilities:**
- Fetch models from `/api/models` on page load
- Populate dropdown with model names
- Handle model selection change
- Load previously selected model from localStorage
- Start new chat when model changes

---

### 2. **Chat Window** (`#chat-window`)
**Responsibility**: Display message history with markdown rendering

**Contents:**
- Message container with alternating user/assistant messages
- Each message: role label + rendered content
- Download buttons on code blocks
- Loading spinner (hidden by default)

**HTML Structure:**
```html
<main id="chat-window">
  <div id="messages">
    <!-- Messages inserted here dynamically -->
    <!-- Structure:
      <div class="message user">
        <div class="role">You</div>
        <div class="content">User text here</div>
      </div>

      <div class="message assistant">
        <div class="role">Assistant</div>
        <div class="content"><!-- rendered markdown --></div>
      </div>
    -->
  </div>
  
  <div id="loading" class="spinner" style="display: none;">
    Loading...
  </div>
</main>
```

**JavaScript Responsibilities:**
- Render message history on page load (from localStorage)
- Add new messages as they arrive (user message immediately, assistant after response)
- Parse markdown and apply syntax highlighting
- Extract code blocks and add download buttons
- Auto-scroll to latest message
- Handle message rendering errors gracefully

---

### 3. **Code Block Handler** (within Chat Window)
**Responsibility**: Detect code blocks and add download functionality

**Detection Logic:**
- Parse rendered markdown for code blocks
- Look for language hints: ` ```js `, ` ```python `, ` ```md `, etc.
- Generate download button with filename suggestion

**HTML Structure (per code block):**
```html
<div class="code-block">
  <div class="code-header">
    <span class="language">JavaScript</span>
    <button class="download-btn" data-content="..." data-language="js">
      Download as .js
    </button>
  </div>
  <pre><code class="language-js">function hello() { ... }</code></pre>
</div>
```

**JavaScript Responsibilities:**
- After markdown rendering, find `<pre><code>` blocks
- Extract language from class name (e.g., `language-js`)
- Generate appropriate filename (e.g., `script.js`)
- Add download button above code block
- Handle download click → call POST /api/download

---

### 4. **Input Area** (`#input-area`)
**Responsibility**: Capture user input and control buttons

**Contents:**
- Message textarea
- Send button
- Clear history button
- Copy response button (copies last assistant message)

**HTML Structure:**
```html
<footer id="input-area">
  <div id="input-controls">
    <textarea 
      id="user-input"
      placeholder="Your message... (press Ctrl+Enter to send)"
      rows="3"
    ></textarea>
    
    <div id="buttons">
      <button id="send-btn">Send</button>
      <button id="clear-btn">Clear History</button>
      <button id="copy-btn" disabled>Copy Response</button>
    </div>
  </div>
</footer>
```

**JavaScript Responsibilities:**
- Handle send button click (or Ctrl+Enter in textarea)
- Validate input (not empty)
- Disable send button while request pending
- Handle clear history (confirm, then wipe localStorage)
- Handle copy response (copy last message text to clipboard)
- Show/hide copy button (only enabled if there's a message to copy)

---

### 5. **State Manager** (JavaScript object)
**Responsibility**: Centralized state management for chat data

**Data Structure:**
```javascript
const appState = {
  // Current chat session
  messages: [
    { role: 'user', content: 'Text', timestamp: 2026-05-09T... },
    { role: 'assistant', content: 'Text', timestamp: 2026-05-09T... }
  ],
  selectedModel: 'llama2',
  isLoading: false,
  
  // Methods
  addMessage(role, content) { ... },
  clearMessages() { ... },
  saveToLocalStorage() { ... },
  loadFromLocalStorage() { ... },
  setLoading(bool) { ... }
}
```

**Storage Details:**
- **localStorage key**: `chatHistory`
- **Format**: JSON string of messages array
- **Persistence**: Auto-save after each message
- **Load**: On page load, restore chat history
- **Clear**: User clicks "Clear History" button

---

### 6. **API Client** (JavaScript object)
**Responsibility**: Handle all HTTP requests to backend

**Methods:**
```javascript
const apiClient = {
  async getModels() { ... },           // GET /api/models
  async sendMessage(model, messages) { ... }, // POST /api/chat
  async downloadFile(content, filename) { ... }, // POST /api/download
  handleError(error) { ... }          // Centralized error handling
}
```

**Error Handling:**
- Ollama unavailable (502) → show user-friendly message
- Timeout (504) → show "Ollama took too long" message
- Network error → show "Connection failed" message
- File too large (413) → show "File too large" message
- Malformed request (400) → log to console, show generic error

---

## HTML Structure (Complete)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ollama Chat Frontend</title>
  <link rel="stylesheet" href="style.css">
  
  <!-- Syntax highlighting -->
  <link rel="stylesheet" 
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  
  <!-- Markdown parser -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header id="header">
      <h1>Ollama Chat</h1>
      <div id="model-selector">
        <label for="model-dropdown">Model:</label>
        <select id="model-dropdown">
          <option>Loading models...</option>
        </select>
      </div>
    </header>

    <!-- Chat window -->
    <main id="chat-window">
      <div id="messages"></div>
      <div id="loading" class="spinner" style="display: none;">
        <p>Waiting for response...</p>
      </div>
    </main>

    <!-- Input area -->
    <footer id="input-area">
      <div id="input-controls">
        <textarea 
          id="user-input"
          placeholder="Your message... (press Ctrl+Enter to send)"
          rows="4"
        ></textarea>
        
        <div id="buttons">
          <button id="send-btn" class="btn btn-primary">Send</button>
          <button id="clear-btn" class="btn btn-secondary">Clear History</button>
          <button id="copy-btn" class="btn btn-secondary" disabled>Copy Response</button>
        </div>
      </div>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

---

## CSS Organization

**Key Sections (in `style.css`):**

```css
/* 1. Reset & Base Styles */
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* 2. Layout */
#app { display: flex; flex-direction: column; height: 100vh; }
#header { padding: 1rem; background: #f5f5f5; border-bottom: 1px solid #ddd; }
#chat-window { flex: 1; overflow-y: auto; padding: 1rem; }
#input-area { padding: 1rem; border-top: 1px solid #ddd; background: #fafafa; }

/* 3. Messages */
.message { margin-bottom: 1rem; }
.message.user { text-align: right; }
.message.assistant { text-align: left; }
.message .role { font-weight: bold; color: #666; }
.message .content { margin-top: 0.5rem; padding: 0.75rem; border-radius: 8px; }
.message.user .content { background: #007bff; color: white; }
.message.assistant .content { background: #e9ecef; color: #333; }

/* 4. Code Blocks */
.code-block { margin: 1rem 0; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; }
.code-header { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #e9ecef; border-bottom: 1px solid #ddd; }
.download-btn { padding: 0.25rem 0.75rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.download-btn:hover { background: #218838; }

/* 5. Input & Buttons */
#user-input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 1rem; }
#buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.btn { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.btn-primary { background: #007bff; color: white; border: none; }
.btn-primary:hover { background: #0056b3; }
.btn-secondary { background: #f5f5f5; color: #333; }
.btn-secondary:hover { background: #e9ecef; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 6. Loading Spinner */
.spinner { display: flex; align-items: center; justify-content: center; }
.spinner::after { content: ''; animation: spin 0.6s linear infinite; border: 2px solid #f3f3f3; border-top: 2px solid #007bff; border-radius: 50%; width: 20px; height: 20px; }

/* 7. Markdown Rendered Content */
#chat-window h1, #chat-window h2, #chat-window h3 { margin-top: 1rem; margin-bottom: 0.5rem; }
#chat-window code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: 'Courier New', monospace; }
#chat-window pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
#chat-window a { color: #007bff; text-decoration: none; }
#chat-window a:hover { text-decoration: underline; }
```

---

## JavaScript State & Flow

### Initialization (on page load)

```javascript
// 1. Fetch available models
apiClient.getModels()
  .then(models => {
    populateModelDropdown(models)
    loadSelectedModel()  // from localStorage
  })

// 2. Load chat history from localStorage
appState.loadFromLocalStorage()

// 3. Render existing messages
if (appState.messages.length > 0) {
  renderChatHistory()
}

// 4. Set up event listeners
setupEventListeners()
```

### User Sends Message Flow

```javascript
// 1. User clicks send (or presses Ctrl+Enter)
userInput.value → validate → not empty

// 2. Add user message to state & UI
appState.addMessage('user', userInput.value)
renderNewMessage('user', userInput.value)
userInput.value = ''
appState.saveToLocalStorage()

// 3. Set loading state
appState.setLoading(true)
sendBtn.disabled = true
loadingSpinner.show()

// 4. Call backend
apiClient.sendMessage(selectedModel, appState.messages)
  .then(response => {
    // 5. Add assistant message to state & UI
    appState.addMessage('assistant', response.message.content)
    renderNewMessage('assistant', response.message.content)
    appState.saveToLocalStorage()
    
    // 6. Parse markdown & add download buttons
    parseMarkdownAndHighlight()
    addDownloadButtons()
  })
  .catch(error => {
    showError(error.message)
  })
  .finally(() => {
    // 7. Clear loading state
    appState.setLoading(false)
    sendBtn.disabled = false
    loadingSpinner.hide()
  })
```

### Model Switch Flow

```javascript
modelDropdown.onChange → handleModelSwitch()
  → appState.clearMessages()
  → localStorage.clear() for chat history
  → renderChatWindow() (now empty)
  → save selected model to localStorage
```

---

## Markdown & Syntax Highlighting

**Process:**

1. **Backend sends**: Assistant message as plain text (may contain markdown)
2. **Frontend receives**: JSON response with message content
3. **Parse markdown**: Use `marked.js` to convert markdown → HTML
4. **Highlight code**: Use `highlight.js` to syntax highlight code blocks
5. **Add download buttons**: Find `<pre><code>` blocks, detect language, add buttons
6. **Render to DOM**: Insert HTML into message container

**Example:**

```
Backend sends:
"Here's a function:\n\n```python\ndef hello():\n  print('hi')\n```"

Frontend parses:
<p>Here's a function:</p>
<pre><code class="language-python">def hello():
  print('hi')</code></pre>

Frontend highlights & adds download:
<p>Here's a function:</p>
<div class="code-block">
  <div class="code-header">
    <span class="language">Python</span>
    <button class="download-btn" data-language="py">Download as .py</button>
  </div>
  <pre><code class="language-python hljs"><span class="hljs-keyword">def</span> <span class="hljs-title">hello</span>():
  <span class="hljs-built_in">print</span>(<span class="hljs-string">'hi'</span>)</code></pre>
</div>
```

---

## File Download Process

**User clicks download button on code block:**

```
1. Extract code content from <code> block
2. Detect language from class name (language-js, language-py, etc.)
3. Generate filename (script.js, main.py, etc.)
4. Call POST /api/download
   { "content": "...", "filename": "script.js" }
5. Backend validates & streams file
6. Browser downloads to Downloads folder
```

**Error Handling:**
- File > 10MB → backend returns 413 → show "File too large"
- Invalid filename → use default "download.txt"
- Network error → show "Download failed"

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTIONS                         │
│                                                                  │
│  Model Selected  →  Header (Component 1)                        │
│  ↓                 ├→ Trigger: clearMessages()                  │
│                    ├→ Call: apiClient.getModels()               │
│                    └→ Store: selectedModel to localStorage      │
│                                                                  │
│  Message Sent    →  Input Area (Component 4)                    │
│  ↓                 ├→ Trigger: addMessage(user, ...)            │
│                    ├→ Call: apiClient.sendMessage()             │
│                    └→ Trigger: renderNewMessage()               │
│                                                                  │
│  Response Recv   →  State Manager (Component 5)                 │
│  ↓                 ├→ Trigger: addMessage(assistant, ...)       │
│                    ├→ Save: appState.saveToLocalStorage()       │
│                    └→ Trigger: renderNewMessage()               │
│                                                                  │
│  Render Message  →  Chat Window (Component 2)                   │
│  ↓                 ├→ Parse: marked.js (markdown)               │
│                    ├→ Highlight: highlight.js (syntax)          │
│                    └→ Enhance: Code Block Handler (Component 3) │
│                       ├→ Find: <code> blocks                    │
│                       └→ Add: Download buttons                  │
│                                                                  │
│  Download Click  →  Code Block Handler (Component 3)            │
│  ↓                 └→ Call: apiClient.downloadFile()            │
│                       └→ Backend streams file → browser download │
│                                                                  │
│  Clear History   →  Input Area (Component 4)                    │
│  ↓                 ├→ Trigger: appState.clearMessages()         │
│                    ├→ localStorage.removeItem('chatHistory')    │
│                    └→ Trigger: renderChatWindow() (empty)       │
│                                                                  │
│  Copy Response   →  Input Area (Component 4)                    │
│  ↓                 └→ navigator.clipboard.writeText(lastMsg)    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Strategy

**All errors follow this pattern:**

```javascript
try {
  // API call or DOM manipulation
  const response = await apiClient.sendMessage(...)
  renderNewMessage(...)
} catch (error) {
  // Catch & display error
  if (error.code === 'CONNECTION_REFUSED') {
    showError('Ollama is not running. Is it installed?')
  } else if (error.code === 'TIMEOUT') {
    showError('Ollama took too long. Try again.')
  } else {
    showError(`Error: ${error.message}`)
  }
  
  // Log for debugging
  console.error('[ERROR]', error)
  
  // Recovery
  appState.setLoading(false)
  sendBtn.disabled = false
}
```

---

## localStorage Schema

**Key: `chatHistory`**
**Value: JSON-stringified array of messages**

```json
[
  {
    "role": "user",
    "content": "Write a function to sum two numbers",
    "timestamp": "2026-05-09T12:34:56Z"
  },
  {
    "role": "assistant",
    "content": "Here's a Python function:\n\n```python\ndef sum_numbers(a, b):\n  return a + b\n```",
    "timestamp": "2026-05-09T12:34:58Z"
  }
]
```

**Key: `selectedModel`**
**Value: String (model name)**

```
"llama2"
```

---

## Performance Considerations

### What to Optimize in v1
- ✅ Markdown parsing (marked.js is fast)
- ✅ Syntax highlighting (highlight.js is fast, cache highlighted blocks)
- ✅ DOM updates (batch DOM inserts, don't re-render entire chat)
- ✅ localStorage (keep < 5MB of chat history)

### What NOT to Optimize in v1
- ❌ Streaming responses (deferred to v2)
- ❌ Virtual scrolling (v1 assumes < 100 messages)
- ❌ Image loading (responses are text/code)

### Target Metrics
- Page load: < 2 seconds
- Send message → response displays: < 1 second (excluding Ollama inference)
- Markdown rendering: < 100ms per message
- Syntax highlighting: < 100ms per message

---

## Rework Notes for v2+ (Multi-User)

### 1. Streaming Responses
- **Current**: Wait for full response, then display
- **v2**: Listen for streamed tokens, display as they arrive
- **Implementation**: WebSocket or Server-Sent Events (SSE)

### 2. Multi-Conversation UI
- **Current**: Single chat thread
- **v2**: Sidebar with conversation list, switch between threads
- **Implementation**: Component refactor (split into ConversationList + ChatWindow)

### 3. Session Management
- **Current**: No auth, single user
- **v2**: Login, session tokens, per-user data
- **Implementation**: Add login page, store JWT in localStorage, attach to requests

### 4. File Storage
- **Current**: Download to browser's Downloads folder
- **v2**: Store on server, browse/manage uploaded files
- **Implementation**: New component (FileManager), API endpoints for file ops

### 5. Responsive Design
- **Current**: Desktop-first, not mobile-responsive
- **v2**: Add mobile CSS media queries, touch-friendly buttons
- **Implementation**: CSS updates, test on mobile browsers

---

## Implementation Checklist

Use this to track frontend implementation progress:

### Phase 1: HTML Structure
- [ ] Create index.html with all sections
- [ ] Link CSS and JavaScript files
- [ ] Link CDN libraries (marked.js, highlight.js)
- [ ] Test page loads (empty content OK)

### Phase 2: Styling (CSS)
- [ ] Create style.css with all component styles
- [ ] Layout (flexbox for header/chat/footer)
- [ ] Message styling (user vs assistant colors)
- [ ] Button styling
- [ ] Code block styling
- [ ] Responsive layout (no mobile yet, just desktop)
- [ ] Test visual appearance in browser

### Phase 3: State Management (app.js)
- [ ] Create appState object with data structure
- [ ] Implement appState.addMessage()
- [ ] Implement appState.clearMessages()
- [ ] Implement appState.saveToLocalStorage()
- [ ] Implement appState.loadFromLocalStorage()
- [ ] Implement appState.setLoading()
- [ ] Test state changes in browser console

### Phase 4: API Client (app.js)
- [ ] Create apiClient object
- [ ] Implement apiClient.getModels()
  - [ ] Test: fetch models from backend
  - [ ] Test: handle Ollama unavailable error
- [ ] Implement apiClient.sendMessage()
  - [ ] Test: send message, receive response
  - [ ] Test: handle timeout error
  - [ ] Test: handle network error
- [ ] Implement apiClient.downloadFile()
  - [ ] Test: download code block
  - [ ] Test: handle file too large error
- [ ] Implement apiClient.handleError()

### Phase 5: Event Listeners (app.js)
- [ ] Set up send button click listener
- [ ] Set up Ctrl+Enter in textarea
- [ ] Set up model dropdown change listener
- [ ] Set up clear history button
- [ ] Set up copy response button
- [ ] Test all buttons trigger correct functions

### Phase 6: Initialization (app.js)
- [ ] On page load: fetch models and populate dropdown
- [ ] On page load: load chat history from localStorage
- [ ] On page load: render existing messages
- [ ] Test: refresh page, chat persists
- [ ] Test: refresh page, selected model persists

### Phase 7: Message Rendering (app.js)
- [ ] Implement renderNewMessage(role, content)
  - [ ] Create message DOM element
  - [ ] Parse markdown with marked.js
  - [ ] Highlight code with highlight.js
  - [ ] Append to messages container
  - [ ] Auto-scroll to bottom
- [ ] Implement renderChatHistory()
  - [ ] Loop through appState.messages
  - [ ] Call renderNewMessage() for each
- [ ] Test: messages display correctly
- [ ] Test: code blocks highlighted
- [ ] Test: markdown formatting applied (bold, italics, headers)

### Phase 8: Download Buttons (app.js)
- [ ] Implement addDownloadButtons()
  - [ ] Find all <code> blocks in rendered messages
  - [ ] Extract language from class name
  - [ ] Generate appropriate filename
  - [ ] Create download button DOM element
  - [ ] Add click listener
- [ ] Implement downloadCodeBlock(content, filename)
  - [ ] Call apiClient.downloadFile()
  - [ ] Show success/error message
- [ ] Test: download button appears on code blocks
- [ ] Test: click download → file downloads
- [ ] Test: filename is correct (hello.js, not hello.txt)

### Phase 9: Error Handling (app.js)
- [ ] Implement showError(message)
  - [ ] Display error in chat window or alert
  - [ ] Log to console
- [ ] Test: Ollama unavailable → show error
- [ ] Test: Timeout → show error
- [ ] Test: File too large → show error
- [ ] Test: Network error → show error
- [ ] Test: Malformed input → show error

### Phase 10: User Experience Polish (app.js)
- [ ] Disable send button while loading
- [ ] Show loading spinner while waiting for response
- [ ] Copy button only enabled when there's a message to copy
- [ ] Confirm before clearing history
- [ ] Feedback on successful copy
- [ ] Keyboard shortcuts (Ctrl+Enter to send)
- [ ] Test: UX feels responsive

### Phase 11: Testing & Debugging
- [ ] Open browser DevTools console
  - [ ] Check for JavaScript errors
  - [ ] Verify appState changes
  - [ ] Verify API calls succeed
- [ ] Test full end-to-end flow
  - [ ] Load page
  - [ ] Select model
  - [ ] Send message
  - [ ] View response
  - [ ] Download code block
  - [ ] Clear history
  - [ ] Refresh page (history persists)
- [ ] Test edge cases
  - [ ] Empty message
  - [ ] Very long message
  - [ ] Response with no code blocks
  - [ ] Response with multiple code blocks
  - [ ] Kill Ollama, try to send message

### Phase 12: Documentation & Cleanup
- [ ] Write comments in app.js (especially complex functions)
- [ ] Update README.md with frontend setup
- [ ] Test file served correctly (no console errors)
- [ ] Remove debug code
- [ ] Final visual pass (alignment, colors, spacing)

---

## Directory Structure (Recap)

```
local-ollama-chat/
├── static/
│   ├── index.html              ← Start here
│   ├── style.css               ← Then this
│   ├── app.js                  ← Then this (main logic)
│   └── lib/                    ← CDN libraries optional locally
├── server.py                   ← Backend (built separately)
├── requirements.txt            ← Backend dependencies
├── README.md                   ← Setup instructions
├── PRD.md                      ← Product requirements
├── BACKEND_ARCHITECTURE.md     ← Backend design
└── FRONTEND_ARCHITECTURE.md    ← This file
```

---

## Common Pitfalls & How to Avoid Them

| Pitfall | How to Avoid |
|---------|-------------|
| Code blocks not getting download buttons | Always run `addDownloadButtons()` after rendering markdown |
| Messages not persisting on refresh | Call `appState.saveToLocalStorage()` after each message |
| Selected model forgotten on refresh | Save selected model to localStorage, load on init |
| Send button not disabled while loading | Set `sendBtn.disabled = appState.isLoading` in state change |
| Markdown not rendering | Ensure `marked.js` is loaded from CDN before `app.js` runs |
| Syntax highlighting not working | Ensure `highlight.js` is loaded AND call `hljs.highlightAll()` after render |
| File downloads with wrong filename | Check language detection (look for ` ```js `, ` ```python `, etc.) |
| Chat history grows unbounded | Consider cleanup in v2 (e.g., keep last 100 messages) |
| Auto-scroll not working | Call `messagesContainer.scrollTop = messagesContainer.scrollHeight` after each message |

---

## Next Steps

1. Start with **Phase 1** (HTML structure) — get the page to load
2. Move to **Phase 2** (CSS) — make it look right
3. Build **Phase 3-5** (state, API, events) — make it work
4. Add **Phase 6-8** (rendering, downloads) — core functionality
5. Polish **Phase 9-10** (errors, UX) — production ready
6. Test **Phase 11** — catch edge cases
7. Document **Phase 12** — ready to ship

---

**Questions or blockers?** Reference this document as a specification for frontend implementation.
