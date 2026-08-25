from flask import Flask, jsonify, render_template, request
from datetime import datetime
from system.commands import execute_command
from system.state import game_state

app = Flask(__name__)

APP_TEMPLATES = {
    "terminal": "apps/terminal.html",
    "messages": "apps/messages.html",
    "games": "apps/games.html",
    "games/tictactoe": "apps/games/tictactoe.html",
    "games/memory": "apps/games/memory.html",
    "files": "apps/files.html",
    "browser": "apps/browser.html",
    "logs": "apps/logs.html",
    "missions": "apps/missions.html",
    "evidence": "apps/evidence.html",
    "network": "apps/network.html",
    "security": "apps/security.html",
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/panel")
def panel():
    return render_template("panel.html")

@app.route("/desktop")
def desktop():
    return render_template("desktop.html")

@app.route("/nova")
def nova():
    return render_template("nova.html")

@app.route("/apps/<path:app_name>")
def apps(app_name):
    template = APP_TEMPLATES.get(app_name)
    if not template:
        return "App not found", 404
    return render_template(template)

@app.route("/api/messages")
def get_messages():
    return jsonify({"message_unlocked": game_state["message_unlocked"], "access_log_found": game_state["access_log_found"], "network_config_found": game_state["network_config_found"], "system_log_found": game_state["system_log_found"], "challenge01_complete": game_state["challenge01_complete"], "challenge02_complete": game_state["challenge02_complete"], "challenge03_complete": game_state["challenge03_complete"], "current_challenge": game_state["current_challenge"], "unread_messages": game_state["unread_messages"], "messages": game_state["messages"]})

@app.route("/api/state")
def get_state():
    keys = ("message_unlocked", "system_log_found", "access_log_found", "network_config_found", "network_scan_found", "watcher_process_found", "watcher_connection_found", "challenge01_complete", "challenge02_complete", "challenge03_complete", "current_challenge", "unread_messages", "evidence", "evidence_history", "achievements", "commands_used", "nova_history", "last_nova_message", "nova_new_hint", "nova_hint_level", "nova_hint_stage")
    return jsonify({key: game_state[key] for key in keys})

@app.route("/api/messages/read", methods=["POST"])
def mark_messages_read():
    game_state["unread_messages"] = 0
    return jsonify({"ok": True, "unread_messages": 0})

@app.route("/api/terminal", methods=["POST"])
def terminal_command():
    data = request.get_json(silent=True) or {}
    command = str(data.get("command", "")).strip()
    current_dir = str(data.get("cwd", "/home/nexus"))
    result = execute_command(command, current_dir)
    notification = result.get("notification") or {}
    result["new_message"] = bool(notification)
    result["message_stage"] = notification.get("stage", 0)
    result["challenge_complete"] = result.get("challenge_complete", False)
    return jsonify(result)

@app.route("/api/nova")
def get_nova():
    return jsonify({"history": game_state["nova_history"], "last_message": game_state["last_nova_message"], "new_hint": game_state["nova_new_hint"], "hint_level": game_state["nova_hint_level"], "hint_stage": game_state["nova_hint_stage"]})

@app.route("/api/nova/record", methods=["POST"])
def record_nova():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"ok": False}), 400
    is_new_message = game_state["last_nova_message"] != text

    if is_new_message:
        game_state["nova_history"].append({
            "text": text,
            "stage": str(data.get("stage", "")),
            "time": datetime.now().strftime("%H:%M")
        })
        game_state["nova_history"] = game_state["nova_history"][-5:]

    game_state["last_nova_message"] = text
    game_state["nova_new_hint"] = is_new_message
    return jsonify({"ok": True})

@app.route("/api/nova/read", methods=["POST"])
def mark_nova_read():
    game_state["nova_new_hint"] = False
    return jsonify({"ok": True})


@app.route("/api/nova/hint", methods=["POST"])
def nova_hint():
    hints = {
        1: {1: "There's something interesting in the logs.", 2: "One of the log records mentions an address that doesn't belong to NEXUS.", 3: "Try reading /logs/access.log."},
        2: {1: "Now that you know the address, find out what it was exposing.", 2: "A network discovery tool can tell you which services are listening on an address.", 3: "Try nmap 192.168.1.44."},
        3: {1: "The 03:17 timestamp points to a process that started after the connection.", 2: "Inspect the running processes, then compare anything unusual with the network connections.", 3: "Try ps, then netstat."},
    }
    stage = min(max(game_state["current_challenge"], 1), 3)
    level = min(game_state["nova_hint_level"] + 1, 3)
    game_state["nova_hint_level"] = level
    game_state["nova_hint_stage"] = f"challenge{stage}"
    game_state["nova_new_hint"] = False
    return jsonify({"ok": True, "level": level, "text": hints[stage][level]})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
