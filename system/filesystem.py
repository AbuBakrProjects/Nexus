FILESYSTEM = {
    "/": {
        "type": "directory",
        "children": ["home", "etc", "logs", "missions"]
    },
    "/home": {
        "type": "directory",
        "children": ["nexus"]
    },
    "/home/nexus": {
        "type": "directory",
        "children": ["readme.txt", "notes.txt", "network_trace.txt", "watcher_note.txt"]
    },
    "/home/nexus/readme.txt": {
        "type": "file",
        "content": "Welcome to NEXUS OS.\n\nIf you are reading this, the node is awake.\n\nCheck your messages before you trust the desktop."
    },
    "/home/nexus/notes.txt": {
        "type": "file",
        "content": "Check the system logs.\nSomething doesn't look right.\n\nUseful places:\n/logs\n/etc\n/missions"
    },
    "/home/nexus/network_trace.txt": {
        "type": "file",
        "content": "NETWORK TRACE\n\nA scan of 192.168.1.44 found services on 22, 80, and 443.\nThe node is alive.\nThe question is why it is still talking to NEXUS."
    },
    "/home/nexus/watcher_note.txt": {
        "type": "file",
        "content": "WATCHER NOTE\n\nProcess: nexus-watch\nStarted: 03:17\nPurpose: network audit\nStatus: attached to eth0"
    },
    "/etc": {
        "type": "directory",
        "children": ["hostname", "network.conf", "security.conf"]
    },
    "/etc/hostname": {
        "type": "file",
        "content": "nexus-node-01"
    },
    "/etc/network.conf": {
        "type": "file",
        "content": "interface=eth0\naddress=192.168.1.24\ngateway=192.168.1.1"
    },
    "/etc/security.conf": {
        "type": "file",
        "content": "audit=enabled\nwatcher=nexus-watch\nstarted=03:17\nremote_audit=enabled"
    },
    "/logs": {
        "type": "directory",
        "children": ["system.log", "access.log"]
    },
    "/logs/system.log": {
        "type": "file",
        "content": "[03:02] system started\n[03:04] network interface eth0 online\n[03:12] authentication accepted from 192.168.1.44\n[03:17] security service started\n[03:17] audit watcher attached to network interface"
    },
    "/logs/access.log": {
        "type": "file",
        "content": "[03:02] 192.168.1.12 LOGIN SUCCESS\n[03:04] 192.168.1.18 LOGIN SUCCESS\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:12] 192.168.1.44 LOGIN SUCCESS"
    },
    "/missions": {
        "type": "directory",
        "children": ["mission01", "mission02", "mission03"]
    },
    "/missions/mission01": {
        "type": "directory",
        "children": ["brief.txt"]
    },
    "/missions/mission01/brief.txt": {
        "type": "file",
        "content": "MISSION 01\n\nDetermine whether the connection at 03:11 belongs to NEXUS.\n\nSkills: filesystem navigation, logs, IP addresses."
    },
    "/missions/mission02": {
        "type": "directory",
        "children": ["brief.txt"]
    },
    "/missions/mission02/brief.txt": {
        "type": "file",
        "content": "MISSION 02\n\nFind out what 192.168.1.44 was exposing to the network.\n\nSkill focus: service discovery and network scanning."
    },
    "/missions/mission03": {
        "type": "directory",
        "children": ["brief.txt"]
    },
    "/missions/mission03/brief.txt": {
        "type": "file",
        "content": "MISSION 03\n\nIdentify the watcher running on NEXUS and determine what it was connected to.\n\nSkill focus: processes, connections, and evidence correlation."
    }
}