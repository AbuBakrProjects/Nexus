from system.state import game_state, add_evidence, add_message, complete_challenge, advance_scene

OBJECTIVE = """CHAPTER 01 · THE WATCHER\n\nDetermine what machine you are actually sitting on, reconstruct the first network trace, and investigate 192.168.1.44."""

EMAIL_02 = {"sender":"UNKNOWN","time":"03:11","text":"""You're looking in the right place.\n\nBut you're not the first person to access this machine.\n\nKeep digging.\n\n— UNKNOWN"""}

EMAIL_03 = {"sender":"UNKNOWN","time":"03:17","text":"""You found it.\n\nThe connection wasn't the whole story.\n\nLook at what happened around 03:17.\n\n— UNKNOWN"""}

def run_challenge01(command, target=""):
    s = game_state
    if s["challenge01_complete"]:
        return {"complete": True, "notification": None}
    c = command.strip().lower()
    notification = None
    if c == "whoami" and s["story_scene"] <= 2:
        advance_scene(2)
    elif c == "hostname" and s["story_scene"] >= 2:
        advance_scene(3)
    elif c == "ipconfig" and s["story_scene"] >= 3:
        s["ipconfig_found"] = True
        add_evidence("network_identity", "ipconfig", "03:04", "NEXUS is using 192.168.1.24 with gateway 192.168.1.1.")
        advance_scene(4)
    elif c in ("dir", "ls") and s["ipconfig_found"]:
        s["root_dir_found"] = True
        advance_scene(5)
    elif c in ("cd logs", "cd /logs") and s["root_dir_found"]:
        s["logs_dir_found"] = True
        advance_scene(6)
    elif target == "/logs/network.log" and c.startswith(("type ", "cat ")) and s["logs_dir_found"]:
        if not s["network_log_found"]:
            s["network_log_found"] = True
            add_evidence("network_log", "/logs/network.log", "03:17", "192.168.1.44 connected immediately before the network configuration change; NEXUS-WATCH initialized at 03:17:04.")
            add_message(EMAIL_02)
            advance_scene(7)
            notification = {"title":"NEW MESSAGE","text":"UNKNOWN sent another message.","sender":"UNKNOWN","stage":1}
    elif target == "/logs/access.log" and c.startswith(("type ", "cat ")) and s["network_log_found"]:
        if not s["access_log_story_found"]:
            s["access_log_story_found"] = True
            s["access_log_found"] = True
            add_evidence("access_log_story", "/logs/access.log", "03:16:51", "192.168.1.44 established a remote connection immediately before the 03:17 change.")
            advance_scene(8)
    elif c == "nmap 192.168.1.44" and s["access_log_story_found"]:
        s["network_scan_found"] = True
        s["nmap_found"] = True
        add_evidence("network_scan", "NMAP", "03:17", "192.168.1.44 exposes SSH, HTTP, and HTTPS.")
        if "network_ghost" not in s["achievements"]: s["achievements"].append("network_ghost")
        advance_scene(9)
    elif c == "tasklist" and s["nmap_found"]:
        s["tasklist_found"] = True
        add_evidence("watcher_process", "tasklist", "03:17", "nexus-watch.exe is running with PID 3172.")
        complete_challenge(1)
        advance_scene(10)
        add_message(EMAIL_03)
        notification = {"title":"CHAPTER TRACE COMPLETE","text":"The first network trace has been reconstructed.","sender":"UNKNOWN","stage":2}
    return {"complete": s["challenge01_complete"], "notification": notification}
