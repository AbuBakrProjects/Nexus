TITLE = "THE SECOND TRACE"


INTRO = """UNKNOWN

You found the first trace.

It leads somewhere deeper.

The node is hiding more than old login attempts."""


OBJECTIVE = """CHALLENGE 02

Find the next piece of evidence."""


SUCCESS = """CHALLENGE 02 COMPLETE.

The trail continues."""


def run_challenge02(command, target):
    return {
        "complete": False,
        "notification": None
    }
