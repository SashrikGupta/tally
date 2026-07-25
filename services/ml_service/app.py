"""
Chat service for the in-app assistant.

Contract with the client (client/src/lib/api.js):
  POST /chat         -> {"answer": "..."}
  POST /chat/stream  -> text/event-stream of `data: {"delta": "..."}` frames
  GET  /health       -> {"status": "ok", ...}

Both take {"message": str, "history": [{"role", "content"}, ...]}.

`/predict` is kept as an alias because the pre-rewrite client called it.

The reply itself comes from the bundled intent classifier in chat.py. That
model is loaded lazily: importing it pulls in torch and reads data.pth, which
takes seconds and fails outright if the ML dependencies were never installed.
Deferring it means the process still boots and answers /health, and a missing
model degrades to a clear message instead of a crash at startup.
"""

import json
import os
import time

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Same allowlist style as the Node services — the browser sends these requests
# cross-origin from the Vite dev server.
CLIENT_ORIGIN = os.environ.get("CLIENT_ORIGIN", "http://localhost:5173")
CORS(app, resources={r"/*": {"origins": [CLIENT_ORIGIN, "http://127.0.0.1:5173"]}})

PORT = int(os.environ.get("PORT", "2983"))

_responder = None
_load_error = None


def responder():
    """Imports chat.get_response on first use; caches the failure if it fails."""
    global _responder, _load_error
    if _responder is not None or _load_error is not None:
        return _responder

    try:
        from chat import get_response

        _responder = get_response
    except Exception as err:  # torch missing, data.pth absent, corrupt weights…
        _load_error = str(err)
        app.logger.error("chat model unavailable: %s", err)
    return _responder


FALLBACK = (
    "The assistant model isn't loaded on this server. "
    "Install the ML dependencies (pip install -r requirements.txt) and restart it."
)


def answer_for(message):
    if not message or not message.strip():
        return "Ask me something about CodeConnect — points, contests, queries or the playground."
    fn = responder()
    if fn is None:
        return FALLBACK
    try:
        return fn(message)
    except Exception as err:
        app.logger.exception("chat inference failed")
        return "Sorry — the assistant hit an error: {}".format(err)


def read_message():
    payload = request.get_json(silent=True) or {}
    return payload.get("message", "")


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "model": "unavailable" if _load_error else ("loaded" if _responder else "not yet loaded"),
            "error": _load_error,
        }
    )


@app.route("/chat", methods=["POST"])
def chat():
    return jsonify({"answer": answer_for(read_message())})


@app.route("/predict", methods=["POST"])
def predict():
    """Legacy route from the pre-rewrite client."""
    return jsonify({"answer": answer_for(read_message())})


@app.route("/chat/stream", methods=["POST"])
def chat_stream():
    """
    Server-sent events, one word per frame.

    The classifier returns a whole canned response at once, so there is nothing
    real to stream — but the client's stream reader is the path that renders
    incrementally, and chunking here keeps that path exercised and makes the
    reply feel typed rather than pasted.
    """
    # Stripped and re-split on runs of whitespace: several canned responses in
    # intents.json have leading/doubled spaces, which a plain split(" ") turns
    # into empty deltas the client would render as stalled frames.
    text = answer_for(read_message()).strip()

    def frames():
        for i, word in enumerate(text.split()):
            delta = word if i == 0 else " " + word
            yield "data: {}\n\n".format(json.dumps({"delta": delta}))
            time.sleep(0.02)
        yield "data: {}\n\n".format(json.dumps({"done": True}))

    return Response(
        frames(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    # threaded so a streaming response doesn't block the next request; debug off
    # because the reloader would fork a second process that dev.py can't track.
    print("chat_service listening on port {}".format(PORT), flush=True)
    app.run(host="127.0.0.1", port=PORT, debug=False, threaded=True)
