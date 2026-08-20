# Local LLM Chat

A minimal local front end for [Ollama](https://ollama.com). Flask backend proxies chat requests to Ollama; a single-page vanilla JS/HTML/CSS frontend renders the conversation, with markdown rendering and per-code-block download.

## Prerequisites

- [Ollama](https://ollama.com) installed, with at least one model pulled (`ollama pull llama3`)
- Python 3.9+ (a `.venv` with dependencies already set up is included in this repo)

## Startup

**1. Make sure Ollama is running.**

```bash
ollama list
```

If that returns your models without error, Ollama's already running as a background service. If not, start it:

```bash
ollama serve
```

**2. Start the Flask backend.**

> ⚠️ Port **5000** is claimed by macOS AirPlay Receiver — always run on **5001**.

```bash
FLASK_PORT=5001 .venv/bin/python server.py
```

**3. Open the app.**

```
http://localhost:5001
```

Flask serves the frontend directly (`static/index.html`) — there's no separate frontend dev server.

## Configuration

Environment variables (all optional, set via `.env` or inline):

| Variable | Default | Purpose |
|---|---|---|
| `FLASK_PORT` | `5000` | Port the Flask server binds to. Use `5001`. |
| `OLLAMA_HOST` | `http://localhost:11434` | Where Ollama's API is reachable. |
| `OLLAMA_TIMEOUT` | `120` | Seconds to wait for a chat response from Ollama. |

## Project layout

```
server.py            Flask backend — routes below
static/
  index.html          App shell
  app.js              State, API calls, rendering, code-block download
  style.css           Dark theme styling
requirements.txt      flask, flask-cors, requests, python-dotenv
requirements - 2026-05/   Original planning docs (PRD, architecture, setup checklist)
```

### Backend routes (`server.py`)

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Serves the frontend (`static/index.html`) |
| `/api/models` | GET | Proxies `GET {OLLAMA_HOST}/api/tags` — lists locally available models |
| `/api/chat` | POST | Proxies `POST {OLLAMA_HOST}/api/chat` (non-streaming) |
| `/api/download` | POST | Returns posted text content as a downloadable file (10 MB cap) |

## Models available locally

As of last check: `qwen2.5-coder:1.5b-instruct-q4_K_M`, `qwen2.5-coder:7b-instruct-q4_K_M`, `llama3:latest`, `gpt-oss:latest`, `codellama:latest`. Pull more with `ollama pull <model>`; new models appear automatically via `/api/models`.

## Troubleshooting

- **"Ollama unavailable" / ECONNREFUSED in the UI** — Ollama isn't running. Run `ollama serve` or `ollama list` to check.
- **Nothing loads at localhost:5001** — confirm the Flask process is actually running and didn't fall back to port 5000 (AirPlay will silently occupy 5000).
- **Port 5000 conflict** — this is expected on macOS; always use `FLASK_PORT=5001`.

## License

MIT — see [LICENSE](LICENSE).
