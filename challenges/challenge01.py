from system.state import game_state, add_evidence, add_message, complete_challenge

TITLE = "NEXUS NODE 01"
INTRO = """UNKNOWN

If you're seeing this, then NEXUS came back online.

It wasn't supposed to.

The last shutdown was recorded.
The restart wasn't.

Don't trust what the desktop tells you.
Something happened before you arrived.

There are traces of it all over this machine.

Logs.
Connections.
Old system files.

Start by looking around.

If you know how to use the terminal, you already know where to begin.
If you don't...

That's okay.

Open it.

I'll tell you what you need to know when you need it.

— UNKNOWN"""

SECOND_MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:11",
    "text": """You found the part I was worried about.

192.168.1.44

Don't assume it's an intruder yet.

An unfamiliar address isn't proof of anything.
We need something to compare it with.

Find out what address belongs to NEXUS itself.

Look through the system configuration.

Start with:
/etc

If you're not familiar with the terminal, ask NOVA.
She'll keep you from getting lost.

— UNKNOWN"""
}

SUCCESS_MESSAGE = {
    "sender": "UNKNOWN",
    "time": "03:17",
    "text": """So.

Now you know.

192.168.1.44 wasn't NEXUS.
Someone else was connecting to this machine.

And they tried three times before they got in.

That's the part that bothers me.

But there's something else.

I need you to find out what happened at 03:17.

Don't open the system log yet.
There's another way in.

I'll contact you again.

— UNKNOWN"""
}

OBJECTIVE = """CHALLENGE 01

Determine whether the connection recorded at 03:11 belongs to NEXUS.

Investigate the access logs, identify the suspicious address, then compare it with NEXUS's own network configuration."""
SUCCESS = """CHALLENGE 01 COMPLETE.

192.168.1.44 does not belong to NEXUS.

Someone else was connecting to this machine."""

def run_challenge01(command, target):
    if game_state["challenge01_complete"]:
        return {"complete": True, "notification": None}
    if target == "/logs/access.log" and command.startswith("cat "):
        if not game_state["access_log_found"]:
            game_state["access_log_found"] = True
            add_message(SECOND_MESSAGE)
            add_evidence("access_log", "/logs/access.log", "03:11", "192.168.1.44 failed three times, then authenticated.")
            return {"complete": False, "notification": {"title": "NEW MESSAGE", "text": "UNKNOWN sent you another message.", "sender": "UNKNOWN", "stage": 1}}
    if target == "/etc/network.conf" and command.startswith("cat ") and game_state["access_log_found"]:
        if not game_state["network_config_found"]:
            game_state["network_config_found"] = True
            complete_challenge(1)
            add_message(SUCCESS_MESSAGE)
            add_evidence("network_config", "/etc/network.conf", "03:04", "NEXUS identifies itself as 192.168.1.24; .44 is a different node.")
            if "who_is_44" not in game_state["achievements"]: game_state["achievements"].append("who_is_44")
            return {"complete": True, "notification": {"title": "CHALLENGE 01 COMPLETE", "text": "UNKNOWN sent you another message.", "sender": "UNKNOWN", "stage": 2}}
    return {"complete": game_state["challenge01_complete"], "notification": None}
