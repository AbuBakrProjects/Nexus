from system.state import game_state, add_evidence, add_message, complete_challenge

TITLE = "THE SECOND TRACE"
INTRO = """UNKNOWN

You found the first trace.

It leads somewhere deeper.

The node is hiding more than old login attempts.

You have an address now. Find out what that address was exposing."""
OBJECTIVE = """CHALLENGE 02

Find out what 192.168.1.44 was offering to the network.

Use a network scan to identify its services.
Then follow the local evidence to 03:17."""
SUCCESS = """CHALLENGE 02 COMPLETE.

The connection wasn't just a login.
Something happened after access was granted.

03:17 is the next lead."""
MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:18",
    "text": """You found the second trace.

The node was exposing more than it should have.

Now look at what NEXUS recorded at 03:17.

This time, the system log is exactly where I want you to look.

— UNKNOWN"""
}

def run_challenge02(command, target):
    if not game_state["challenge01_complete"] or game_state["challenge02_complete"]:
        return {"complete": game_state["challenge02_complete"], "notification": None}
    if command == "nmap 192.168.1.44":
        if not game_state["network_scan_found"]:
            game_state["network_scan_found"] = True
            add_evidence("network_scan", "NMAP", "03:12", "192.168.1.44 exposes SSH, HTTP, and HTTPS.")
            if "network_ghost" not in game_state["achievements"]: game_state["achievements"].append("network_ghost")
            return {"complete": False, "notification": None}
    if target == "/logs/system.log" and command.startswith("cat ") and game_state["network_scan_found"]:
        if not game_state["system_log_found"]:
            game_state["system_log_found"] = True
            complete_challenge(2)
            add_message(MESSAGE)
            add_evidence("system_log", "/logs/system.log", "03:17", "The security service starts and an audit watcher attaches to the network interface.")
            return {"complete": True, "notification": {"title": "CHALLENGE 02 COMPLETE", "text": "The second trace has been recorded.", "sender": "UNKNOWN", "stage": 3}}
    return {"complete": game_state["challenge02_complete"], "notification": None}
