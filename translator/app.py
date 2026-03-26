from flask import Flask, request, jsonify

from src.translator import translate

app = Flask(__name__)


@app.route("/")
def handle_translate():
    content = request.args.get("content", "")
    if not content:
        return jsonify({"error": "Missing 'content' parameter"}), 400

    is_english, translated_content = translate(content)
    return jsonify({
        "is_english": is_english,
        "translated_content": translated_content,
    })
