from system.state import game_state, add_evidence, add_message, complete_challenge, advance_scene

FINAL_MESSAGES = [
    {"sender":"UNKNOWN","time":"03:20","text":"You found it.\n\nNow you understand why I told you to keep digging.\n\n.44 wasn't trying to get into NEXUS. It was trying to get your attention.\n\nDon't trust the watcher.\n\nAnd whatever you do... don't disable it.\n\n— UNKNOWN"},
]

def run_challenge03(command, target=""):
    s = game_state
    if not s["challenge02_complete"] or s["chapter01_complete"]:
        return {"complete": s["challenge03_complete"], "notification": None}
    c = command.strip().lower()
    notification = None
    if c in ("dir", "ls") and s["recovery_message_found"]:
        advance_scene(23)
    elif c in ("cd /nexus/services", "cd nexus/services"):
        advance_scene(24)
    elif c in ("dir", "ls") and s["story_scene"] >= 24 and not s["watcher_log_found"]:
        advance_scene(25)
    elif target == "/NEXUS/services/service.log" and c.startswith(("type ", "cat ")):
        s["watcher_log_found"] = True
        add_evidence("watcher_log", "service.log", "03:19:00", "NEXUS-WATCH detected an anomaly and enabled a local action.")
        advance_scene(26)
    elif target == "/NEXUS/services/watch.conf" and c.startswith(("type ", "cat ")) and s["watcher_log_found"] and not s["watcher_isolate_found"]:
        s["watcher_isolate_found"] = True
        add_evidence("watcher_isolate", "watch.conf", "03:19", "The watcher can isolate the network when an anomaly is detected.")
        advance_scene(27)
    elif target == "/NEXUS/archive/watcher_original.conf" and c.startswith(("type ", "cat ")):
        s["original_config_found"] = True
        add_evidence("original_watcher", "watcher_original.conf", "04/12/2024", "The original watcher was passive and log-only, unlike the current active isolate configuration.")
        advance_scene(28)
    elif target == "/NEXUS/archive/admin_record.txt" and c.startswith(("type ", "cat ")) and s["original_config_found"]:
        s["abubakr_record_found"] = True
        add_evidence("admin_record", "admin_record.txt", "UNKNOWN", "The original watcher was authorized by system architect Abubakr; the account is now revoked.")
        advance_scene(29)
    elif target == "/NEXUS/services/watch.conf" and c.startswith(("type ", "cat ")) and s["abubakr_record_found"] and not s["watcher_modified_found"]:
        s["watcher_modified_found"] = True
        add_evidence("watcher_modified", "watch.conf", "03:17:04", "The watcher configuration was modified by SYSTEM at the incident timestamp.")
        advance_scene(30)
    elif c == "tasklist" and s["watcher_modified_found"]:
        s["sync_process_found"] = True
        add_evidence("sync_process", "tasklist", "03:17:03", "nexus-sync.exe started one second before nexus-watch.")
        advance_scene(31)
    elif c == "netstat -ano" and s["sync_process_found"]:
        s["sync_connection_found"] = True
        add_evidence("sync_connection", "netstat -ano", "03:17:03", "nexus-sync.exe connected to 192.168.1.44.")
        advance_scene(32)
    elif target == "/NEXUS/services/sync.conf" and c.startswith(("type ", "cat ")) and s["sync_connection_found"]:
        s["sync_config_found"] = True
        add_evidence("sync_config", "sync.conf", "03:17:03", "NEXUS-SYNC was operating in RECOVERY mode against 192.168.1.44.")
        advance_scene(33)
    elif c == "connect 192.168.1.44" and s["sync_config_found"]:
        s["final_message_found"] = True
        add_evidence("final_recovery_lead", "192.168.1.44", "03:17", "The remote node says to find what NEXUS was trying to recover and warns that 03:17 was not the beginning.")
        complete_challenge(3)
        s["chapter01_complete"] = True
        advance_scene(34)
        add_message({"sender":"UNKNOWN","time":"03:21","text":"""You finally found the real connection.\n\nDon't look for me.\n\nLook for what NEXUS was trying to recover.\n\n03:17 was not the beginning.\n\n— UNKNOWN"""})
        notification = {"title":"CHAPTER 01 COMPLETE","text":"THE WATCHER — the recovery lead is waiting.","sender":"UNKNOWN","stage":5}
    return {"complete": s["chapter01_complete"], "notification": notification}
