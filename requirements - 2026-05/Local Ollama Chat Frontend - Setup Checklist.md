## Prerequisites  
  
### Step 1: Verify Ollama Installation  
- [ ] Ollama is running locally  
- [ ] Test Ollama connection: `curl http://localhost:11434/api/tags`  
- [ ] Expected output: JSON list of available models  
- [ ] Default port confirmed as 11434  
  
---  
  
## Choose Your Backend Stack  
  
### Option A: Python + Flask (Recommended)  
  
#### Step 2: Check Python Version  
```bash  
python3 --version```  
- [ ] Python 3.8 or higher installed  
- [ ] If not installed, install via Homebrew: `brew install python3`  
  
#### Step 3: Create Virtual Environment  
```bash  
cd /Users/dks0790958/PycharmProjects/PythonProject/local-ollamapython3 -m venv venvsource venv/bin/activate```  
- [ ] Virtual environment created  
- [ ] Activated (you should see `(venv)` in your terminal prompt)  
  
#### Step 4: Install Python Dependencies  
```bash  
pip install --upgrade pippip install flask flask-cors requests```  
- [ ] Flask installed (web framework)  
- [ ] flask-cors installed (handles cross-origin requests)  
- [ ] requests installed (HTTP client for Ollama API)  
- [ ] Verify: `pip list` (should show flask, flask-cors, requests)  
  
---  
  
### Option B: Node.js + Express  
  
#### Step 2: Check Node.js Version  
```bash  
node --versionnpm --version```  
- [ ] Node.js 14 or higher installed  
- [ ] npm installed  
- [ ] If not installed: `brew install node`  
  
#### Step 3: Initialize Project  
```bash  
cd /Users/dks0790958/PycharmProjects/PythonProject/local-ollamanpm init -y```  
- [ ] `package.json` created  
  
#### Step 4: Install Node Dependencies  
```bash  
npm install express cors axios```  
- [ ] express installed (web framework)  
- [ ] cors installed (CORS middleware)  
- [ ] axios installed (HTTP client for Ollama API)  
- [ ] Verify: `npm list` (should show express, cors, axios)  
  
---  
  
## Frontend Setup (Both Options)  
  
### Step 5: Create Directory Structure  
```bash  
mkdir -p static/lib```  
- [ ] `static/` folder created  
- [ ] `static/lib/` folder created  
  
### Step 6: Create Static Files  
In the `static/` folder, create:  
- [ ] `index.html` - Main chat interface HTML  
- [ ] `style.css` - Styling for the chat interface  
- [ ] `app.js` - JavaScript logic for chat functionality  
  
### Step 7: Add Markdown/Syntax Libraries  
Choose one of the following:  
  
**Option A: Use CDN (no download needed)**  
- [ ] Include `marked.js` via CDN in index.html  
- [ ] Include `highlight.js` via CDN in index.html  
  
**Option B: Download Locally**  
```bash  
# Download marked.js  
curl -o static/lib/marked.js https://cdn.jsdelivr.net/npm/marked/marked.min.js  
  
# Download highlight.js  
curl -o static/lib/highlight.js https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js  
curl -o static/lib/highlight.css https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css  
```  
- [ ] `marked.js` downloaded or CDN link verified  
- [ ] `highlight.js` downloaded or CDN link verified  
- [ ] CSS stylesheet for syntax highlighting configured  
  
---  
  
## Backend Setup  
  
### Step 8: Create Backend Server File  
  
**For Python:**  
```bash  
# Create server.py in local-ollama root  
touch server.py  
```  
- [ ] `server.py` created in `/Users/dks0790958/PycharmProjects/PythonProject/local-ollama/`  
  
**For Node.js:**  
```bash  
# Create server.js in local-ollama root  
touch server.js  
```  
- [ ] `server.js` created in `/Users/dks0790958/PycharmProjects/PythonProject/local-ollama/`  
  
### Step 9: Add Backend Logic  
- [ ] Backend server configured to proxy requests to Ollama  
- [ ] CORS handling configured  
- [ ] `/api/chat` endpoint implemented (proxies POST requests to Ollama's `/api/chat`)  
- [ ] `/api/models` endpoint implemented (fetches models from Ollama's `/api/tags` and returns formatted JSON)  
- [ ] Static file serving configured (serves HTML/CSS/JS from `./static` folder)  
  
### Step 9a: Model Selection Implementation Details  
- [ ] Backend `/api/models` endpoint returns list of installed models  
- [ ] Frontend fetches models on page load via JavaScript  
- [ ] Model dropdown in HTML populated dynamically with fetched models  
- [ ] Selected model stored in JavaScript variable  
- [ ] Selected model persisted to browser localStorage  
- [ ] Selected model passed in every chat request to backend  
  
---  
  
## Model Selection Architecture  
  
### How It Works  
1. **Page Load** → Frontend calls `GET /api/models`  
2. **Backend** → Proxies request to Ollama `GET /api/tags`  
3. **Response** → Backend returns JSON with model list  
4. **Dropdown** → Frontend populates HTML `<select>` element  
5. **User Selection** → JavaScript stores selected model in localStorage  
6. **Chat Message** → Selected model is sent with each message to `/api/chat`  
  
### Data Flow Diagram  
```  
Browser → /api/models → Backend → Ollama /api/tags → Backend → Browser  
   ↓Dropdown populated with model names  
   ↓User selects model (stored in localStorage)  
   ↓User sends message → Backend includes model in Ollama request  
   ↓Response from selected model displayed in chat  
```  
  
### Key Files Involved  
- `app.js` - Contains JavaScript to fetch models and populate dropdown  
- `index.html` - Has `<select id="modelSelect">` element for model dropdown  
- `server.py` (or `server.js`) - Has `/api/models` endpoint that proxies to Ollama  
  
---  
  
## Testing  
  
### Step 10: Verify Ollama Connection  
```bash  
curl http://localhost:11434/api/tags```  
- [ ] Returns JSON list of models  
- [ ] No connection errors  
  
### Step 11: Start Backend Server  
  
**For Python:**  
```bash  
source venv/bin/activate  # If not already activatedpython3 server.py```  
- [ ] Server starts without errors  
- [ ] Terminal shows: `Running on http://localhost:5000`  
  
**For Node.js:**  
```bash  
node server.js```  
- [ ] Server starts without errors  
- [ ] Terminal shows: `Server running on http://localhost:3000`  
  
### Step 12: Open Frontend in Browser  
- [ ] Open browser to `http://localhost:5000` (Python) or `http://localhost:3000` (Node.js)  
- [ ] Chat interface loads without errors  
- [ ] No JavaScript console errors  
  
### Step 13: Test Chat Functionality  
- [ ] Model dropdown populates with available models from Ollama  
- [ ] At least 2 models visible in dropdown (or user has multiple models installed)  
- [ ] Can select different model from dropdown  
- [ ] Selected model persists after page refresh (localStorage working)  
- [ ] Can type message in input field  
- [ ] Send button is clickable  
- [ ] Message appears in chat history  
- [ ] Response received from Ollama using selected model  
- [ ] Response rendered as markdown  
- [ ] Syntax highlighting works on code blocks  
- [ ] Switching models mid-conversation works (new messages use new model)  
  
### Step 14: Test Copy Functionality  
- [ ] Copy button visible on responses  
- [ ] Can copy response text  
- [ ] Copied text is accessible  
  
### Step 15: Test Session Persistence  
- [ ] Refresh browser page  
- [ ] Chat history still visible  
- [ ] localStorage persisting data correctly  
  
---  
  
## Troubleshooting  
  
### Connection Issues  
```bash  
# Verify Ollama is running  
curl http://localhost:11434/api/tags  
  
# Check if port is in use  
lsof -i :5000  # Python  
lsof -i :3000  # Node.js  
```  
  
### Dependency Issues  
```bash  
# Python  
pip list  
pip install --upgrade pip setuptools wheel  
  
# Node.js  
npm list  
npm cache clean --force  
npm install  
```  
  
### CORS Errors  
- [ ] Backend has `flask-cors` (Python) or `cors` middleware (Node.js) configured  
- [ ] Headers properly set to allow localhost requests  
  
### Model Selection Issues  
```bash  
# Test if Ollama models endpoint works  
curl http://localhost:11434/api/tags  
  
# Test if backend models endpoint works  
curl http://localhost:5000/api/models    # Python  
curl http://localhost:3000/api/models    # Node.js  
```  
  
- [ ] `/api/tags` returns JSON with models array  
- [ ] Backend `/api/models` endpoint returns formatted model list  
- [ ] Dropdown in frontend is empty → Check browser console for errors  
- [ ] Model not persisting after refresh → Check if localStorage is enabled in browser  
- [ ] Cannot send chat with selected model → Verify model name is being passed in JSON payload  
  
---  
  
## Completion  
  
- [ ] All prerequisites met  
- [ ] Backend installed and running  
- [ ] Frontend files created  
- [ ] Chat interface functional  
- [ ] All success criteria met (from requirements.md)  
- [ ] Ready for development/enhancement  
  
---  
  
## File Structure Verification  
  
```  
local-ollama/  
├── requirements.md              ✓  
├── setup-checklist.md          ✓  
├── server.py (or server.js)    ├── static/  
│   ├── index.html              │   ├── style.css               │   ├── app.js                  │   └── lib/  
│       ├── marked.js           │       └── highlight.js        ├── venv/ (Python only)         └── node_modules/ (Node.js only)  
```  
  
---  
  
## Next Steps After Setup  
- [ ] Customize CSS styling  
- [ ] Add system prompts/personality  
- [ ] Implement conversation history saving  
- [ ] Add model parameter controls (temperature, etc.)  
- [ ] Performance optimizations