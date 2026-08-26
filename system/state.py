INITIAL_MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:02",
    "text": """If you're reading this, NEXUS is running again.\n\nI don't know who started it.\n\nI don't know why.\n\nBut someone has been waiting for this machine to come back online.\n\nBefore you do anything else, find out what machine you're actually sitting on.\n\nDon't trust what the desktop tells you.\n\n— UNKNOWN"""
}

game_state = {
    "current_challenge": 1,
    "story_scene": 1,
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
    "chapter01_complete": False,
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
    "ipconfig_found": False,
    "root_dir_found": False,
    "logs_dir_found": False,
    "network_log_found": False,
    "access_log_story_found": False,
    "nmap_found": False,
    "netstat_found": False,
    "tasklist_found": False,
    "watcher_pid_found": False,
    "netstat_pid_found": False,
    "watcher_config_found": False,
    "system_timeline_found": False,
    "admin_target_found": False,
    "password_attempts_found": False,
    "missing_seconds_found": False,
    "temp_file_found": False,
    "recovery_message_found": False,
    "unknown_warning_found": False,
    "watcher_log_found": False,
    "watcher_isolate_found": False,
    "original_config_found": False,
    "abubakr_record_found": False,
    "watcher_modified_found": False,
    "sync_process_found": False,
    "sync_connection_found": False,
    "sync_config_found": False,
    "final_message_found": False,
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
    game_state["current_challenge"] = min(number + 1, 3)
    game_state["nova_hint_level"] = 0

def advance_scene(scene):
    game_state["story_scene"] = max(game_state["story_scene"], scene)
    game_state["nova_hint_level"] = 0
