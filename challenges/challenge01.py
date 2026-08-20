from system.state import game_state

TITLE = "NEXUS NODE 01"

INTRO = """UNKNOWN

If you're seeing this, then NEXUS came back online.

It wasn't supposed to.

The last shutdown was recorded.

The restart wasn't.

I don't know how long you've been connected,
so I'm going to keep this short.

Don't trust what the desktop tells you.

Something happened before you arrived.

There are traces of it all over this machine.

Logs.
Connections.
Old system files.

Start by looking around.

If you know how to use the terminal,
you already know where to begin.

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

That's the mistake people make.

An unfamiliar address isn't proof of anything.

We need something to compare it with.

Find out what address belongs to NEXUS itself.

You won't find the answer in the access log.

Look through the system configuration.

Start with:

/etc

If you're not familiar with the terminal,
ask NOVA.

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

And they tried three times
before they got in.

That's the part that bothers me.

But there's something else.

I need you to find out
what happened at 03:17.

Don't open the system log yet.

There's another way in.

I'll contact you again.

— UNKNOWN"""
}

OBJECTIVE = """CHALLENGE 01

Find out who connected to NEXUS.

Start by investigating the access logs.

Then compare the suspicious address
with NEXUS's own network configuration."""

SUCCESS = """CHALLENGE 01 COMPLETE.

192.168.1.44 does not belong to NEXUS.

Someone else was connecting to this machine."""

def run_challenge01(command, target):
    if game_state["challenge01_complete"]:
        return {
            "complete": True,
            "notification": None
        }

    if (
        command == "cat /logs/access.log"
        and target == "/logs/access.log"
    ):
        if not game_state["access_log_found"]:
            game_state["access_log_found"] = True
            game_state["message_unlocked"] = True
            game_state["unread_messages"] += 1
            game_state["messages"].append(
                SECOND_MESSAGE
            )

            return {
                "complete": False,
                "notification": {
                    "title": "NEW MESSAGE",
                    "text": "UNKNOWN sent you another message.",
                    "sender": "UNKNOWN",
                    "stage": 1
                }
            }

    if (
        command == "cat /etc/network.conf"
        and target == "/etc/network.conf"
    ):
        if game_state["access_log_found"]:
            if not game_state["network_config_found"]:
                game_state["network_config_found"] = True
                game_state["challenge01_complete"] = True
                game_state["current_challenge"] = 2
                game_state["unread_messages"] += 1
                game_state["messages"].append(
                    SUCCESS_MESSAGE
                )

                return {
                    "complete": True,
                    "notification": {
                        "title": "CHALLENGE 01 COMPLETE",
                        "text": "UNKNOWN sent you another message.",
                        "sender": "UNKNOWN",
                        "stage": 2
                    }
                }

    return {
        "complete": game_state["challenge01_complete"],
        "notification": None
    }