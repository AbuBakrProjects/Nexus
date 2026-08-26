# NEXUS — Season 1
## Chapter 01 — The Watcher

This chapter is implemented as a state-driven investigation. The player is never required to follow one exact UI path: terminal commands, logs, configuration files, processes, and system apps expose the same evidence as the investigation progresses.

## Scene 01 — Entering NEXUS

Boot completes and the desktop appears normal. A new UNKNOWN message tells the player to discover what machine they are actually sitting on.

NOVA says to establish the machine identity without revealing a command.

**First discoveries**

```text
whoami
nexus\\operator

hostname
NEXUS-NODE-01
```

## Scene 02 — The Network Identity

NOVA explains that a hostname is only a name. The player investigates the network configuration.

```text
ipconfig

Windows IP Configuration

Ethernet adapter NEXUS:

   IPv4 Address............. 192.168.1.24
   Subnet Mask.............. 255.255.255.0
   Default Gateway..........192.168.1.1
```

NEXUS reports `192.168.1.24`, but its records indicate that the address changed.

## Scene 03 — Finding the Records

The player discovers the top-level machine records with `dir` and finds `Logs`.

The story teaches discovery instead of assuming the player already knows where evidence lives.

## Scene 04 — The Logs

The player enters `Logs` and lists the records.

```text
cd Logs
dir
```

The four logs are:

- `system.log`
- `access.log`
- `network.log`
- `startup.log`

The player reads `network.log` and finds:

```text
[03:16:51] REMOTE CONNECTION ATTEMPT
SOURCE: 192.168.1.44

[03:17:02] NETWORK CONFIGURATION CHANGED
PREVIOUS ADDRESS: 192.168.1.17
CURRENT ADDRESS: 192.168.1.24

[03:17:04] NEXUS-WATCH INITIALIZED
```

The 03:17 timestamp becomes a clue rather than an explanation.

## Scene 05 — Access Log

`type access.log` reveals the remote connection from `192.168.1.44` immediately before the change.

UNKNOWN sends a second message telling the player to keep digging.

## Scene 06 — Investigating .44

The player discovers the exposed services:

```text
nmap 192.168.1.44

PORT      STATE     SERVICE
22/tcp    open      ssh
80/tcp    open      http
443/tcp   open      https
```

NOVA explains service discovery and the attack surface without declaring `.44` malicious.

## Scene 07 — The First Wrong Theory

The player checks active connections:

```text
netstat

TCP    192.168.1.24:443    192.168.1.44:51231    ESTABLISHED
```

NOVA explicitly warns that a reasonable theory is not the same as proof.

This completes the first investigation arc.

---

# Continuation — The Watcher

## Scene 08 — Finding the Process

The player runs:

```text
tasklist
```

and finds:

```text
nexus-watch.exe    3172
```

## Scene 09 — The PID

The player correlates the process with the connection:

```text
netstat -ano

TCP    192.168.1.24:443    192.168.1.44:51231    ESTABLISHED    3172
```

NOVA explains why a PID is useful during investigation.

## Scene 10 — What Is NEXUS-WATCH?

The player queries the executable path:

```text
wmic process where "name='nexus-watch.exe'" get ProcessId,ExecutablePath
```

Result:

```text
C:\NEXUS\services\nexus-watch.exe
3172
```

## Scene 11 — The Configuration

Inside `C:\NEXUS\services`, the player finds `watch.conf` and `service.log`.

`watch.conf` contains:

```text
MODE: ACTIVE
TARGET: 192.168.1.44
INTERVAL: 30
ACTION: MONITOR
STARTED: 03:17:04
ON_ANOMALY:
    ACTION: ISOLATE
```

## Scene 12 — 03:17

The system timeline records five failed administrator authentication attempts followed by a security event and watcher initialization.

## Scene 13 — The Failed Login

`net user` confirms that `Administrator` is a valid local account.

The system log records five rapid failed attempts from `.44` between `03:16:51` and `03:16:55`.

## Scene 14 — The Missing Six Seconds

The player compares the network log and finds:

```text
03:16:56 CONNECTION STATE: ESTABLISHED
03:16:57 REMOTE DATA TRANSFER — 4 KB
03:16:58 REMOTE DATA TRANSFER — 4 KB
03:16:59 CONNECTION CLOSED
```

The six-second gap becomes a real forensic clue.

## Scene 15 — The Temporary File

The player enters `C:\NEXUS\temp` and discovers `session_0316.tmp`.

Its contents:

```text
NEXUS NODE 01

RECOVERY REQUEST

NODE STATUS: COMPROMISED

DO NOT TRUST LOCAL SECURITY SERVICE

REQUEST SOURCE: 192.168.1.44

MESSAGE:

THE WATCHER IS NOT FOR ME.
```

This completes the second investigation arc.

---

# The Recovery Lead

## Scene 16 — UNKNOWN Interrupts

UNKNOWN warns the player not to disable the watcher and claims `.44` was trying to get their attention.

## Scene 17 — Watcher Log

`service.log` reveals:

```text
03:19:00 ANOMALY DETECTED
03:19:01 RESPONSE: NONE
03:19:02 LOCAL ACTION: ENABLED
```

## Scene 18 — Isolate

The watcher configuration reveals that its automated response is `ISOLATE`.

## Scene 19 — Original Configuration

`watcher_original.conf` shows that the original watcher was passive and `LOG_ONLY`.

## Scene 20 — A Name

`admin_record.txt` identifies the original authorized operator as:

```text
ABUBAKR
ROLE: SYSTEM ARCHITECT
ACCESS: ROOT
STATUS: REVOKED
```

## Scene 21 — The Modified Configuration

The current watcher configuration was modified at `03:17:04` by `SYSTEM`.

## Scene 22 — The Second Process

A new process appears:

```text
nexus-sync.exe
PID: 4021
STARTED: 03:17:03
```

## Scene 23 — The Connection

`netstat -ano` connects the new process to `.44`:

```text
192.168.1.24:52172 -> 192.168.1.44:443
PID: 4021
```

## Scene 24 — Sync Configuration

`sync.conf` says:

```text
NEXUS SYNC SERVICE

REMOTE:
192.168.1.44

MODE:
RECOVERY

SOURCE:
NODE 01

AUTH:
LOCAL SYSTEM

PURPOSE:
UNKNOWN
```

The investigation now shows that `.44` was not simply attacking NEXUS. NEXUS was attempting to recover something through `.44`.

## Scene 25 — The Final Discovery

The player connects to the known remote node:

```text
connect 192.168.1.44
```

NEXUS displays:

```text
REMOTE CONNECTION DETECTED

192.168.1.44

INCOMING MESSAGE

You finally found the real connection.

Don't look for me.

Look for what NEXUS was trying to recover.

03:17 was not the beginning.
```

The connection closes.

NOVA identifies the next lead: the recovery protocol and whatever happened before 03:17.

---

# Chapter 01 Complete

```text
NEXUS

CHAPTER 01 — THE WATCHER

STATUS: COMPLETE

PRIMARY DISCOVERY:
NEXUS-WATCH

NEW LEAD:
NEXUS RECOVERY PROTOCOL

UNKNOWN:
192.168.1.44

TIME OF INCIDENT:
03:17

NEXT:
FIND WHAT NEXUS WAS TRYING TO RECOVER.
```

The game then shows the creator debrief from **AbuBakr — NEXUS Creator** and a disabled `NEXT CHAPTER · COMING SOON` action until the next chapter exists.

## Implemented learning concepts

- Machine identity
- Hostnames and IP addresses
- Filesystem discovery
- Log analysis
- Authentication records
- Network service discovery with Nmap
- Active connection analysis with netstat
- Process inspection and PIDs
- Timeline correlation
- Configuration analysis
- Incident reconstruction
- Evidence-based reasoning
- Distinguishing suspicion from proof
