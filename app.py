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
    scene_before = game_state["story_scene"]
    result = execute_command(command, current_dir)
    result["story_advanced"] = game_state["story_scene"] > scene_before
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
        1: ("Start with the machine's basic identity.", "Use the terminal to learn which user is operating NEXUS.", "cat? No — use whoami."),
        2: ("The hostname tells you what the machine calls itself.", "Find the terminal command that reports the machine name.", "Use: hostname"),
        3: ("We need NEXUS's network identity.", "Check the current network configuration.", "Use: ipconfig"),
        4: ("If the address changed, NEXUS should have records of it.", "Look through the top-level folders for the logs.", "Use: dir"),
        5: ("The records are probably inside the Logs folder.", "Enter Logs and inspect what is inside.", "Use: cd Logs, then dir"),
        6: ("The network record should show what happened around 03:17.", "Read the network log.", "Use: cat network.log"),
        7: ("The suspicious source address appears before the configuration change.", "Read the access record and look for the same address.", "Use: cat access.log"),
        8: ("An IP address alone does not tell us what a host is offering.", "Investigate the services exposed by .44.", "Use: nmap 192.168.1.44"),
        9: ("We need to connect the remote connection to a local process.", "List the processes currently running on NEXUS.", "Use: tasklist"),
        10: ("The watcher process is now identified.", "Verify the live connection between NEXUS and 192.168.1.44.", "Use: netstat"),
        11: ("The executable's location can tell us where it came from.", "Query nexus-watch for its process ID and executable path.", 'Use: wmic process where "name=\'nexus-watch.exe\'" get ProcessId,ExecutablePath'),
        12: ("The watcher has a configuration file.", "Go to NEXUS/services and inspect the files there.", "Use: cd /NEXUS/services, then dir"),
        13: ("The watcher configuration explains what it monitors.", "Read watch.conf.", "Use: cat watch.conf"),
        14: ("The timeline around 03:17 contains the failed authentication.", "Read the system log.", "Use: cd /logs, then cat system.log"),
        15: ("The failed request targeted an account. Verify whether it exists.", "List the local user accounts.", "Use: net user"),
        16: ("Five rapid attempts are visible in the timeline.", "Re-read system.log and focus on 03:16:51–03:16:55.", "Use: cat system.log"),
        17: ("There are six seconds missing from the story.", "Compare the network log with the system timeline.", "Use: cat network.log"),
        18: ("Transferred data has to land somewhere.", "Look in the NEXUS temp directory.", "Use: cd /NEXUS/temp, then dir"),
        19: ("A file created during the transfer may contain the request.", "Read session_0316.tmp.", "Use: cat session_0316.tmp"),
        20: ("The temporary directory contains a new session record.", "Enter NEXUS/temp and inspect what was created around 03:16.", "Use: cd /NEXUS/temp, then dir"),
        21: ("The session record is the next piece of the trace.", "Read the file created during the missing seconds.", "Use: cat session_0316.tmp"),
        22: ("The recovery request tells us to inspect the watcher.", "Enter NEXUS/services and read the watcher service log.", "Use: cd /NEXUS/services, then cat service.log"),
        23: ("The watcher log shows a local response was enabled.", "Read the watcher configuration to identify that response.", "Use: cat watch.conf"),
        24: ("The current watcher is not the original design.", "Open the archive and compare the original configuration.", "Use: cd /NEXUS/archive, then dir"),
        25: ("The archive contains the original authorization record.", "Read the administrative record.", "Use: cat admin_record.txt"),
        26: ("The original watcher was authorized by Abubakr, but that account is revoked.", "Return to the current watch.conf and look for the modification clue.", "Use: cd /NEXUS/services, then cat watch.conf"),
        27: ("The current watcher was modified at 03:17:04.", "Look for the process that started immediately before it.", "Use: tasklist"),
        28: ("nexus-sync.exe started before nexus-watch.", "Compare its PID with the active network connections.", "Use: netstat -ano"),
        29: ("The sync process is connected to the same remote node.", "Read its configuration to understand why it connected to .44.", "Use: cat sync.conf"),
        30: ("NEXUS-SYNC is running in recovery mode.", "Follow the recovery connection to the known remote node.", "Use: connect 192.168.1.44"),
        31: ("The remote node has become the final piece of this trace.", "Follow the connection to retrieve the recovery lead.", "Use: connect 192.168.1.44"),
        32: ("The recovery connection is confirmed.", "Read sync.conf if you have not already, then follow the recovery action.", "Use: cat sync.conf"),
        33: ("We have reconstructed the recovery path.", "Use the terminal connection to finish the trace.", "Use: connect 192.168.1.44"),
        34: ("Chapter 01 is complete.", "The next investigation is what NEXUS was trying to recover.", "Chapter 02 is not available yet.")
    }
    scene = min(max(scene, 1), 34)
    level = min(game_state["nova_hint_level"] + 1, 3)
    game_state["nova_hint_level"] = level
    game_state["nova_hint_stage"] = f"scene{scene}"
    game_state["nova_new_hint"] = False
    text = hint_sets.get(scene, hint_sets[1])[level - 1]
    return jsonify({"ok": True, "level": level, "text": text})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)