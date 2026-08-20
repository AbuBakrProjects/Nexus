from datetime import datetime

from challenges.challenge01 import run_challenge01
from system.filesystem import FILESYSTEM


def normalize_path(path):
    parts = []

    for part in path.split("/"):
        if part in ("", "."):
            continue

        if part == "..":
            if parts:
                parts.pop()
        else:
            parts.append(part)

    if not parts:
        return "/"

    return "/" + "/".join(parts)


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
                "help       Show available commands\n"
                "clear      Clear terminal\n"
                "pwd        Show current directory\n"
                "ls         List files\n"
                "cd         Change directory\n"
                "cat        Read a file\n"
                "whoami     Show current user\n"
                "hostname   Show system hostname\n"
                "echo       Print text\n"
                "date       Show system date"
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

    if cmd == "date":
        return {
            "output": datetime.now().strftime("%a %b %d %H:%M:%S %Y"),
            "cwd": current_dir
        }

    if cmd == "echo":
        return {
            "output": " ".join(args),
            "cwd": current_dir
        }

    if cmd == "clear":
        return {
            "output": "__CLEAR__",
            "cwd": current_dir
        }

    if cmd == "ls":
        target = current_dir

        if args:
            target = resolve_path(current_dir, args[0])

        item = FILESYSTEM.get(target)

        if not item:
            return {
                "output": f"ls: cannot access '{target}': No such file or directory",
                "cwd": current_dir
            }

        if item["type"] == "file":
            return {
                "output": target,
                "cwd": current_dir
            }

        return {
            "output": "\n".join(item["children"]),
            "cwd": current_dir
        }

    if cmd == "cd":
        if not args:
            target = "/home/nexus"
        else:
            target = resolve_path(current_dir, args[0])

        item = FILESYSTEM.get(target)

        if not item:
            return {
                "output": f"cd: no such file or directory: {args[0]}",
                "cwd": current_dir
            }

        if item["type"] != "directory":
            return {
                "output": f"cd: not a directory: {args[0]}",
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

        target = resolve_path(current_dir, args[0])

        item = FILESYSTEM.get(target)

        if not item:
            return {
                "output": f"cat: {args[0]}: No such file or directory",
                "cwd": current_dir
            }

        if item["type"] != "file":
            return {
                "output": f"cat: {args[0]}: Is a directory",
                "cwd": current_dir
            }

        challenge_result = run_challenge01(
            command,
            target
        )

        return {
            "output": item["content"],
            "cwd": current_dir,
            "challenge_complete": challenge_result["complete"],
            "notification": challenge_result["notification"]
        }

    return {
        "output": (
            f"{cmd}: command not found\n"
            "Type 'help' for available commands."
        ),
        "cwd": current_dir
    }
