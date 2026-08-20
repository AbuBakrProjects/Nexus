TITLE = "THE WATCHER"


INTRO = """UNKNOWN

The system knows you're here now.

Be careful."""


OBJECTIVE = """CHALLENGE 03

Investigate the next clue."""


SUCCESS = """CHALLENGE 03 COMPLETE."""


def run_challenge03(command, target):
    return {
        "complete": False,
        "notification": None
    }
