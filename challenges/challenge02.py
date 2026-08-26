from system.state import game_state, add_evidence, add_message, complete_challenge, advance_scene

EMAIL_04 = {"sender":"UNKNOWN","time":"03:18","text":"""You found the second trace.\n\nNow find out what happened immediately after the failed authentication.\n\nDon't assume .44 is the attacker. Prove what the machine actually did.\n\n— UNKNOWN"""}

def run_challenge02(command, target=""):
    s = game_state
    if not s["challenge01_complete"] or s["challenge02_complete"]:
        return {"complete": s["challenge02_complete"], "notification": None}
    c = command.strip().lower()
    notification = None
    if c == "tasklist":
        s["tasklist_found"] = True
        add_evidence("watcher_process", "tasklist", "03:17", "nexus-watch.exe is running with PID 3172.")
        advance_scene(11)
    elif c == "netstat -ano" and s["tasklist_found"]:
        s["watcher_pid_found"] = True
        s["netstat_pid_found"] = True
        s["watcher_connection_found"] = True
        add_evidence("watcher_pid", "netstat -ano", "03:17", "PID 3172 owns the established connection from NEXUS to 192.168.1.44.")
        advance_scene(12)
    elif c.startswith("wmic process where") and s["watcher_pid_found"]:
        s["watcher_config_found"] = True
        add_evidence("watcher_location", "WMIC", "03:17", "nexus-watch.exe is installed under C:\\NEXUS\\services.")
        advance_scene(13)
    elif c in ("dir", "ls") and s["watcher_config_found"] and s["story_scene"] < 14:
        advance_scene(14)
    elif target == "/NEXUS/services/watch.conf" and c.startswith(("type ", "cat ")) and s["watcher_config_found"]:
        add_evidence("watcher_config", "watch.conf", "03:17:04", "NEXUS-WATCH is configured to monitor 192.168.1.44 in active mode.")
        s["watcher_config_found"] = True
        advance_scene(15)
    elif target == "/logs/system.log" and c.startswith(("type ", "cat ")) and s["admin_target_found"]:
        s["password_attempts_found"] = True
        add_evidence("password_attempts", "/logs/system.log", "03:16:51–03:16:55", "The administrator account was hit five times in less than five seconds.")
        advance_scene(18)
    elif target == "/logs/system.log" and c.startswith(("type ", "cat ")):
        s["system_log_found"] = True
        s["system_timeline_found"] = True
        add_evidence("system_timeline", "/logs/system.log", "03:16:51–03:17:06", "Five failed administrator authentication attempts were followed by a security event and watcher initialization.")
        advance_scene(16)
    elif c == "net user":
        s["admin_target_found"] = True
        add_evidence("administrator_account", "net user", "03:16:51", "Administrator is a valid local account on NEXUS.")
        advance_scene(17)
    elif target == "/logs/network.log" and c.startswith(("type ", "cat ")) and s["password_attempts_found"]:
        s["missing_seconds_found"] = True
        add_evidence("missing_seconds", "/logs/network.log", "03:16:56–03:16:59", "After the failed logins, .44 established a connection and transferred data before disconnecting.")
        advance_scene(19)
        add_message(EMAIL_04)
        notification = {"title":"NEW MESSAGE","text":"UNKNOWN sent a new lead.","sender":"UNKNOWN","stage":3}
    elif c in ("cd /nexus/temp", "cd nexus/temp") and s["missing_seconds_found"]:
        s["temp_file_found"] = True
        advance_scene(20)
    elif c in ("dir", "ls") and s["temp_file_found"] and s["story_scene"] >= 20:
        advance_scene(21)
    elif target == "/NEXUS/temp/session_0316.tmp" and c.startswith(("type ", "cat ")) and s["temp_file_found"]:
        s["recovery_message_found"] = True
        add_evidence("recovery_request", "session_0316.tmp", "03:16:56–03:16:59", "A recovery request from .44 says the watcher is not for it.")
        complete_challenge(2)
        advance_scene(22)
        return {"complete": True, "notification": {"title":"MISSION 02 COMPLETE","text":"The missing six seconds have been explained.","sender":"NOVA","stage":4}}
    return {"complete": s["challenge02_complete"], "notification": notification}
