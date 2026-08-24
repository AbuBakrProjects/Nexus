INITIAL_MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:02",
    "text": """If you're seeing this, then NEXUS came back online.\n\nIt wasn't supposed to.\n\nThe last shutdown was recorded.\nThe restart wasn't.\n\nDon't trust what the desktop tells you.\nSomething happened before you arrived.\n\nThere are traces of it all over this machine.\n\nLogs.\nConnections.\nOld system files.\n\nStart by looking around.\n\nIf you know how to use the terminal, you already know where to begin.\nIf you don't, that's okay.\n\nOpen it.\n\n— UNKNOWN"""
}

game_state = {
    "current_challenge": 1,
    "message_unlocked": True,
    "access_log_found": False,
    "network_config_found": False,
    "system_log_found": False,
    "network_scan_found": False,
    "watcher_process_found": False,
    "watcher_connection_found": False,
    "challenge01_complete": False,
    "challenge02_complete": False,
    "challenge03_complete": False,
    "unread_messages": 1,
    "messages": [INITIAL_MESSAGE],
    "evidence": ["boot_record"],
    "evidence_history": [{"id": "boot_record", "source": "BOOT", "time": "03:02", "finding": "NEXUS restarted unexpectedly.", "status": "RECORDED"}],
    "achievements": ["first_contact"],
    "commands_used": [],
    "nova_history": [],
    "last_nova_message": "",
    "nova_new_hint": False,
    "nova_hint_level": 0,
    "nova_hint_stage": "start",
    "terminal_experiments": {},
}

def add_evidence(evidence_id, source, time, finding, status="DISCOVERED"):
    if evidence_id in game_state["evidence"]:
        return False
    game_state["evidence"].append(evidence_id)
    game_state["evidence_history"].append({"id": evidence_id, "source": source, "time": time, "finding": finding, "status": status})
    game_state["nova_hint_level"] = 0
    return True

def add_message(message):
    game_state["messages"].append(message)
    game_state["unread_messages"] += 1

def complete_challenge(number):
    game_state[f"challenge0{number}_complete"] = True
    game_state["current_challenge"] = number + 1
    game_state["nova_hint_level"] = 0
