from system.state import game_state, add_evidence, add_message, complete_challenge

TITLE = "THE WATCHER"
INTRO = """UNKNOWN

The system knows you're here now.

Be careful.

If 03:17 started a security service, find out what that service was watching."""
OBJECTIVE = """CHALLENGE 03

Investigate the processes running on NEXUS.

Find the watcher, then inspect the network connections it is associated with."""
SUCCESS = """CHALLENGE 03 COMPLETE.

You found the watcher.

Something inside NEXUS was recording activity after the connection.

The question is no longer who .44 was.

It's why NEXUS was watching."""
MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:24",
    "text": """You found it.

There is a process watching the node.
And it has a connection to the same machine you were investigating.

I don't know who started it.

But I think it was running before you arrived.

Keep the evidence. Don't trust assumptions.

— UNKNOWN"""
}

def run_challenge03(command, target):
    if not game_state["challenge02_complete"] or game_state["challenge03_complete"]:
        return {"complete": game_state["challenge03_complete"], "notification": None}
    if command == "ps" and not game_state["watcher_process_found"]:
        game_state["watcher_process_found"] = True
        add_evidence("watcher_process", "ps", "03:17", "nexus-watch is running as a network audit process.")
        return {"complete": False, "notification": None}
    if command == "netstat" and game_state["watcher_process_found"] and not game_state["watcher_connection_found"]:
        game_state["watcher_connection_found"] = True
        complete_challenge(3)
        add_message(MESSAGE)
        add_evidence("watcher_connection", "netstat", "03:17", "NEXUS maintains established connections with 192.168.1.44.")
        if "the_watcher" not in game_state["achievements"]: game_state["achievements"].append("the_watcher")
        return {"complete": True, "notification": {"title": "CHALLENGE 03 COMPLETE", "text": "You found the watcher.", "sender": "UNKNOWN", "stage": 4}}
    return {"complete": game_state["challenge03_complete"], "notification": None}
