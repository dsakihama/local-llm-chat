import os
from io import BytesIO

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

load_dotenv()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", 120))
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

MIME_MAP = {
    ".js": "text/javascript",
    ".py": "text/x-python",
    ".ts": "text/typescript",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".sh": "text/x-shellscript",
    ".go": "text/x-go",
    ".rs": "text/x-rustsrc",
    ".sql": "application/sql",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
}


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/models", methods=["GET"])
def get_models():
    try:
        resp = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ollama unavailable", "code": "ECONNREFUSED"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama timeout", "code": "TIMEOUT"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload.get("model") or not payload.get("messages"):
            return jsonify({"error": "Missing model or messages"}), 400

        payload["stream"] = False

        resp = requests.post(
            f"{OLLAMA_HOST}/api/chat",
            json=payload,
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        return jsonify(resp.json()), 200

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ollama unavailable", "code": "ECONNREFUSED"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama took too long", "code": "TIMEOUT"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/download", methods=["POST"])
def download():
    try:
        payload = request.get_json(silent=True) or {}
        content = payload.get("content", "")
        filename = payload.get("filename", "download.txt")

        if not content or not filename:
            return jsonify({"error": "Missing content or filename"}), 400

        encoded = content.encode("utf-8")
        if len(encoded) > MAX_FILE_SIZE:
            size_mb = round(len(encoded) / 1_000_000, 1)
            return jsonify({"error": f"File too large ({size_mb} MB > 10 MB)", "code": "FILE_TOO_LARGE"}), 413

        ext = os.path.splitext(filename)[1].lower()
        mime = MIME_MAP.get(ext, "text/plain")

        return send_file(
            BytesIO(encoded),
            as_attachment=True,
            download_name=filename,
            mimetype=mime,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def server_error(e):
    app.logger.error(f"Server error: {e}")
    return jsonify({"error": "Server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="localhost", port=port, debug=False)
