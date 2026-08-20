from flask import Flask, render_template, request, jsonify
from datetime import datetime
from system.state import game_state
from challenges.challenge01 import run_challenge01

app = Flask(__name__)

filesystem = {
    "/": {
        "type": "directory",
        "children": [
            "home",
            "etc",
            "logs",
            "missions"
        ]
    },

    "/home": {
        "type": "directory",
        "children": [
            "nexus"
        ]
    },

    "/home/nexus": {
        "type": "directory",
        "children": [
            "Desktop",
            "Documents",
            "Downloads",
            "notes.txt",
            "readme.txt"
        ]
    },

    "/home/nexus/Desktop": {
        "type": "directory",
        "children": []
    },

    "/home/nexus/Documents": {
        "type": "directory",
        "children": []
    },

    "/home/nexus/Downloads": {
        "type": "directory",
        "children": []
    },

    "/home/nexus/notes.txt": {
        "type": "file",
        "content": "Remember to check the network logs."
    },

    "/home/nexus/readme.txt": {
        "type": "file",
        "content": "Welcome to Nexus OS."
    },

    "/etc": {
        "type": "directory",
        "children": [
            "hostname",
            "network.conf"
        ]
    },

    "/etc/hostname": {
        "type": "file",
        "content": "nexus-node-01"
    },

    "/etc/network.conf": {
        "type": "file",
        "content": (
            "interface=eth0\n"
            "address=192.168.1.24\n"
            "gateway=192.168.1.1"
        )
    },

    "/logs": {
        "type": "directory",
        "children": [
            "system.log",
            "access.log"
        ]
    },

    "/logs/access.log": {
        "type": "file",
        "content": (
            "[03:02] 192.168.1.12 LOGIN SUCCESS\n"
            "[03:04] 192.168.1.18 LOGIN SUCCESS\n"
            "[03:11] 192.168.1.44 LOGIN FAILED\n"
            "[03:11] 192.168.1.44 LOGIN FAILED\n"
            "[03:11] 192.168.1.44 LOGIN FAILED\n"
            "[03:12] 192.168.1.44 LOGIN SUCCESS"
        )
    },

    "/logs/system.log": {
        "type": "file",
        "content": (
            "[03:02] system started\n"
            "[03:04] network interface eth0 online\n"
            "[03:17] security service started"
        )
    },

    "/missions": {
        "type": "directory",
        "children": [
            "mission01"
        ]
    },

    "/missions/mission01": {
        "type": "directory",
        "children": [
            "brief.txt"
        ]
    },

    "/missions/mission01/brief.txt": {
        "type": "file",
        "content": (
            "MISSION 01\n\n"
            "Something is wrong with the network.\n"
            "Investigate the access logs."
        )
    }
}


def normalize_path(path):
    if not path:
        return "/"

    parts = []

    for part in path.split("/"):
        if part in ("", "."):
            continue

        if part == "..":
            if parts:
                parts.pop()
        else:
            parts.append(part)

    result = "/" + "/".join(parts)

    return result if result else "/"


def resolve_path(current_dir, path):
    if path.startswith("/"):
        return normalize_path(path)

    return normalize_path(
        current_dir.rstrip("/") + "/" + path
    )


def execute_command(command, current_dir):
    command = command.strip()

    if not command:
        return {
            "output": "",
            "cwd": current_dir
        }

    parts = command.split()
    cmd = parts[0]
    args = parts[1:]

    if cmd == "help":
        return {
            "output": (
                "Available commands:\n"
                "\n"
                "help        Show available commands\n"
                "clear       Clear terminal\n"
                "pwd         Show current directory\n"
                "ls          List files\n"
                "cd          Change directory\n"
                "cat         Read a file\n"
                "whoami      Show current user\n"
                "hostname    Show system hostname\n"
                "echo        Print text\n"
                "date        Show system date"
            ),
            "cwd": current_dir
        }

    if cmd == "pwd":
        return {
            "output": current_dir,
            "cwd": current_dir
        }

    if cmd == "whoami":
        return {
            "output": "nexus",
            "cwd": current_dir
        }

    if cmd == "hostname":
        return {
            "output": "nexus-node-01",
            "cwd": current_dir
        }

    if cmd == "ls":
        target = current_dir

        if args:
            target = resolve_path(
                current_dir,
                args[0]
            )

        item = filesystem.get(target)

        if not item:
            return {
                "output": (
                    f"ls: cannot access '{target}': "
                    "No such file or directory"
                ),
                "cwd": current_dir
            }

        if item["type"] != "directory":
            return {
                "output": target,
                "cwd": current_dir
            }

        return {
            "output": "\n".join(
                item["children"]
            ),
            "cwd": current_dir
        }

    if cmd == "cd":
        target = "/"

        if args:
            target = resolve_path(
                current_dir,
                args[0]
            )

        item = filesystem.get(target)

        if not item:
            return {
                "output": (
                    f"cd: no such file or directory: "
                    f"{args[0]}"
                ),
                "cwd": current_dir
            }

        if item["type"] != "directory":
            return {
                "output": (
                    f"cd: not a directory: "
                    f"{args[0]}"
                ),
                "cwd": current_dir
            }

        return {
            "output": "",
            "cwd": target
        }

    if cmd == "cat":
        if not args:
            return {
                "output": "cat: missing file operand",
                "cwd": current_dir
            }

        target = resolve_path(
            current_dir,
            args[0]
        )

        item = filesystem.get(target)

        if not item:
            return {
                "output": (
                    f"cat: {args[0]}: "
                    "No such file or directory"
                ),
                "cwd": current_dir
            }

        if item["type"] != "file":
            return {
                "output": (
                    f"cat: {args[0]}: "
                    "Is a directory"
                ),
                "cwd": current_dir
            }

        return {
            "output": item["content"],
            "cwd": current_dir
        }

    if cmd == "echo":
        return {
            "output": " ".join(args),
            "cwd": current_dir
        }

    if cmd == "date":
        return {
            "output": datetime.now().strftime(
                "%a %b %d %H:%M:%S %Y"
            ),
            "cwd": current_dir
        }

    if cmd == "clear":
        return {
            "output": "__CLEAR__",
            "cwd": current_dir
        }

    return {
        "output": (
            f"{cmd}: command not found\n"
            "Type 'help' for available commands."
        ),
        "cwd": current_dir
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


@app.route("/apps/terminal")
def terminal():
    return render_template("apps/terminal.html")


@app.route("/apps/messages")
def messages():
    return render_template("apps/messages.html")


@app.route("/nova")
def nova():
    return render_template("nova.html")


@app.route("/api/messages")
def get_messages():
    return jsonify({
        "message_unlocked": game_state["message_unlocked"],
        "access_log_found": game_state["access_log_found"],
        "network_config_found": game_state["network_config_found"],
        "system_log_found": game_state["system_log_found"],
        "challenge01_complete": game_state["challenge01_complete"],
        "current_challenge": game_state["current_challenge"]
    })


@app.route("/api/state")
def get_state():
    return jsonify({
        "message_unlocked": game_state["message_unlocked"],
        "system_log_found": game_state["system_log_found"],
        "access_log_found": game_state.get(
            "access_log_found",
            False
        ),
        "network_config_found": game_state.get(
            "network_config_found",
            False
        ),
        "challenge01_complete": game_state["challenge01_complete"]
    })


@app.route("/api/terminal", methods=["POST"])
def terminal_command():
    data = request.get_json()

    command = data.get(
        "command",
        ""
    ).strip()

    current_dir = data.get(
        "cwd",
        "/home/nexus"
    )

    result = execute_command(
        command,
        current_dir
    )

    challenge_result = run_challenge01(
        command,
        resolve_path(
            current_dir,
            command.split()[1]
        ) if (
            command.startswith("cat ")
            and len(command.split()) > 1
        ) else ""
    )

    new_message = False
    message_stage = 0

    notification = challenge_result.get(
        "notification"
    )

    if notification:
        new_message = True
        message_stage = notification.get(
            "stage",
            0
        )

    result["new_message"] = new_message
    result["message_stage"] = message_stage
    result["challenge_complete"] = (
        challenge_result["complete"]
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)