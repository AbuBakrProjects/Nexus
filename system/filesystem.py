FILESYSTEM = {
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
            "readme.txt",
            "notes.txt"
        ]
    },

    "/home/nexus/readme.txt": {
        "type": "file",
        "content": "Welcome to NEXUS OS."
    },

    "/home/nexus/notes.txt": {
        "type": "file",
        "content": "Check the system logs.\nSomething doesn't look right."
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
        "content": "interface=eth0\naddress=192.168.1.24\ngateway=192.168.1.1"
    },

    "/logs": {
        "type": "directory",
        "children": [
            "system.log",
            "access.log"
        ]
    },

    "/logs/system.log": {
        "type": "file",
        "content": "[03:02] system started\n[03:04] network interface eth0 online\n[03:17] security service started"
    },

    "/logs/access.log": {
        "type": "file",
        "content": "[03:02] 192.168.1.12 LOGIN SUCCESS\n[03:04] 192.168.1.18 LOGIN SUCCESS\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:11] 192.168.1.44 LOGIN FAILED\n[03:12] 192.168.1.44 LOGIN SUCCESS"
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
        "content": "MISSION 01\n\nSomething is wrong with the network.\nInvestigate the access logs."
    }
}
