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
    return jsonify({key: game_state[key] for key in game_state if key not in ("terminal_experiments",)})

@app.route("/api/state")
def get_state():
    keys = tuple(key for key in game_state if key != "terminal_experiments")
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
    result["chapter_complete"] = game_state["chapter01_complete"]
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
    scene = game_state["story_scene"]
    hint_sets = {
        1: ("Start with the machine's basic identity.", "Use the terminal to learn which user is operating NEXUS.", "Try whoami."),
        2: ("The hostname tells you what the machine calls itself.", "Look for the command that reports the machine name.", "Try hostname."),
        3: ("We need NEXUS's network identity.", "Check the current network configuration.", "Try ipconfig."),
        4: ("If the address changed, NEXUS should have records of it.", "List the top-level folders and look for logs.", "Try dir."),
        5: ("The logs are likely to contain the network change.", "Enter the Logs directory and inspect its files.", "Try cd Logs, then dir."),
        6: ("The network record should show what happened around 03:17.", "Read network.log.", "Try type network.log."),
        7: ("The suspicious source address appears before the configuration change.", "Check the access record for the same address.", "Try type access.log."),
        8: ("An IP address alone doesn't tell us what a host is offering.", "Use service discovery against .44.", "Try nmap 192.168.1.44."),
        9: ("We need to connect the remote connection to a local process.", "List running processes.", "Try tasklist."),
        10: ("PID 3172 identifies one specific process.", "Compare that PID with active connections.", "Try netstat -ano."),
        11: ("The executable's location can tell us where it came from.", "Query nexus-watch for its executable path.", 'Try wmic process where "name=\'nexus-watch.exe\'" get ProcessId,ExecutablePath.'),
        12: ("The watcher has a configuration file.", "Look inside C:/NEXUS/services.", "Try cd /NEXUS/services, then dir."),
        13: ("The watcher configuration explains what it monitors.", "Read watch.conf.", "Try type watch.conf."),
        14: ("The timeline around 03:17 contains the failed authentication.", "Read the system log.", "Try cd /logs, then type system.log."),
        15: ("The failed request targeted an account. Verify whether it exists.", "List local user accounts.", "Try net user."),
        16: ("Five rapid attempts are visible in the timeline.", "Re-read the system log and focus on 03:16:51–03:16:55.", "Try type system.log."),
        17: ("There are six seconds missing from the story.", "Compare the network log with the system timeline.", "Try type network.log."),
        18: ("Transferred data has to land somewhere.", "Look in the NEXUS temp directory.", "Try cd /NEXUS/temp, then dir."),
        19: ("A file created during the transfer may contain the payload or request.", "Read session_0316.tmp.", "Try type session_0316.tmp."),
        20: ("The watcher log records what happens after initialization.", "Look at the watcher service log.", "Try cd /NEXUS/services, then type service.log."),
        21: ("The local action is configured somewhere.", "Read the watcher configuration again.", "Try type watch.conf."),
        22: ("The current watcher differs from its original design.", "Search the archive for the original configuration.", "Try cd /NEXUS/archive, then dir."),
        23: ("The original record points to an authorization entry.", "Read the administrative record.", "Try type admin_record.txt."),
        24: ("The current watcher was modified at 03:17:04.", "Check the watcher configuration and its modification clue.", "Try type watch.conf."),
        25: ("Something started one second before the watcher.", "List processes again and look for nexus-sync.", "Try tasklist."),
        26: ("The new process should have a network connection.", "Compare active connections with PIDs.", "Try netstat -ano."),
        27: ("The sync service has a configuration file.", "Read sync.conf in the NEXUS services directory.", "Try type sync.conf."),
        28: ("The remote node is ready to tell you what it wants you to investigate next.", "Connect to the known remote node.", "Try connect 192.168.1.44.")
    }
    scene = min(max(scene, 1), 28)
    level = min(game_state["nova_hint_level"] + 1, 3)
    game_state["nova_hint_level"] = level
    game_state["nova_hint_stage"] = f"scene{scene}"
    game_state["nova_new_hint"] = False
    text = hint_sets.get(scene, hint_sets[1])[level - 1]
    return jsonify({"ok": True, "level": level, "text": text})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)