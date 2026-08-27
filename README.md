# NEXUS OS

> **A browser-based cybersecurity investigation game where the terminal is the interface, the evidence is the puzzle, and NOVA is your mentor.**

NEXUS is built around a simple idea: **don't teach cybersecurity by showing the answer, make the player investigate it.**

You boot into a operating system, inspect files, trace network activity, investigate processes, and gradually reconstruct what happened to the NEXUS NODE 1.

---

## 🌐 Try NEXUS

You can also try the current live version without installing anything locally.

**▶ [Try NEXUS Demo](http://nexus-os-demo.vercel.app)**

Note: The online version is currently a work in progress and may change as new features and story content are added.


---

## Screenshots

| Boot sequence | NEXUS desktop |
|---|---|
| `docs/screenshots/01-boot.png` | `docs/screenshots/02-desktop.png` |

| NOVA mentor | Terminal investigation |
|---|---|
| `docs/screenshots/03-nova.png` | `docs/screenshots/04-terminal.png` |

| Evidence board | Investigation trail |
|---|---|
| `docs/screenshots/05-evidence.png` | `docs/screenshots/06-trail.png` |

| Logs / filesystem | Chapter completion |
|---|---|
| `docs/screenshots/07-logs.png` | `docs/screenshots/08-chapter-complete.png` |

| Memory Game | Tic Tac Toe Game |
|---|---|
| `docs/screenshots/09-Memory.png` | `docs/screenshots/10-tic-tac-toe.png` |

---

## The Concept

Something unusual happens inside NEXUS.

NOVA does not simply tell the player what happened. Instead, she points them toward the next piece of evidence.

The player must:

- establish the machine's identity
- inspect its network configuration
- find the relevant logs
- trace a suspicious remote address
- investigate running processes
- connect processes to network activity
- inspect configuration files
- reconstruct the timeline
- determine what the NEXUS watcher was doing
- follow the recovery connection

The result is closer to an **interactive investigation** than a traditional tutorial.

---

## Chapter 01 — The Watcher

Chapter 01 begins with a suspicious message and an unexplained network change.

The investigation develops through evidence rather than exposition:

```text
Unknown message
      ↓
Machine identity
      ↓
Network identity
      ↓
Logs
      ↓
192.168.1.44
      ↓
NMAP
      ↓
TASKLIST
      ↓
Challenge 01 complete
      ↓
NETSTAT
      ↓
NETSTAT -ANO
      ↓
Process investigation
      ↓
NEXUS-WATCH
      ↓
Configuration + timeline
      ↓
NEXUS-SYNC
      ↓
Recovery connection
      ↓
Chapter 02 complete
```

### Challenge structure

**Challenge 01** establishes the first network trace and ends with the process discovery.

The important transition is:

```text
nmap 192.168.1.44
        ↓
tasklist
        ↓
Challenge 01 COMPLETE
```

**Challenge 02** begins with the network connection verification:

```text
netstat
   ↓
netstat -ano
   ↓
process / watcher investigation
```

This separation keeps the chapter readable and prevents later evidence from appearing before the player has earned it.

---

## NOVA — The Mentor

NOVA is designed as an investigative mentor, not a command dispenser.

Normal story messages tell the player **what to investigate next**.

For example:

> **NEXT: Look for the Logs folder.**

rather than:

> `NEXT: cd Logs`

When the player needs help, the Hint system can become progressively more specific:

```text
LEVEL 1
Think about where system records are normally kept.

        ↓

LEVEL 2
Look for the Logs folder.

        ↓

LEVEL 3
Use: cd Logs
```

For file investigation, commands use the terminal's canonical syntax such as:

```text
cat network.log
cat access.log
cat system.log
cat watch.conf
```

This keeps the main story immersive while still making the game accessible to players who get stuck.

---

## Anti-Skip Story System

NEXUS does not treat the last command typed by the player as proof of progress.

Story progression is tied to **server-side evidence/state**.

For example, typing:

```text
nmap 192.168.1.44
```

early does not automatically unlock the later investigation.

The relevant evidence must actually be discovered before the story advances.

This gives the investigation a real sequence:

```text
Evidence discovered
        ↓
Server state updated
        ↓
Challenge progression
        ↓
NOVA recalculates the current objective
```

It also makes browser reloads safer because NOVA can reconstruct the current investigation from the stored state rather than blindly restarting or jumping forward.

---

## Core Features

### Terminal

A simulated command-line environment for the investigation.

Current investigation commands include:

```text
whoami
hostname
ipconfig
dir
ls
cd
cat
nmap
netstat
netstat -ano
tasklist
wmic
net user
connect
clear
```

### NOVA Mentor

- contextual story messages
- progressive hints
- explicit investigation objectives
- mentor history
- state-aware progression
- no unnecessary command dumping during the main story

### Virtual Filesystem

The player investigates simulated NEXUS directories and files rather than the real machine.

Important areas include:

```text
/Logs
/NEXUS/services
/NEXUS/temp
/NEXUS/archive
```

### Evidence System

Discoveries are turned into evidence that can be reviewed later.

Examples include:

- network traces
- suspicious IP addresses
- process information
- watcher configuration
- authentication events
- recovery records
- administrative records

### Investigation Trail

The player can see the case develop as discoveries are made instead of having every answer revealed from the start.

### Desktop UI

NEXUS is presented as a complete simulated operating system rather than a plain terminal page.

The UI includes areas for:

- desktop/workspace
- terminal
- NOVA
- messages/notifications
- evidence
- investigation progress
- chapter completion

---

## Project Structure

```text
Nexus-main/
├── app.py
├── requirements.txt
├── package.json
├── README.md
│
├── challenges/
│   ├── challenge01.py
│   ├── challenge02.py
│   └── challenge03.py
│
├── system/
│   ├── commands.py
│   ├── filesystem.py
│   └── state.py
│
├── templates/
│   ├── index.html
│   ├── desktop.html
│   ├── panel.html
│   └── nova.html
│
├── static/
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── audio/
│
└── docs/
    ├── story/
    └── screenshots/
```

---

## How It Works

NEXUS uses Flask for the application layer and JavaScript for the browser-side operating-system interface.

At a high level:

```text
Browser UI
    ↓
JavaScript terminal / NOVA / desktop
    ↓
Flask API
    ↓
Command engine + game state
    ↓
Challenge logic
    ↓
Evidence + story progression
    ↓
Updated UI
```

The important architectural rule is that **the backend remains authoritative for story progression**.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/AbuBakrProjects/Nexus.git
cd Nexus
```

### 2. Create a virtual environment

Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start NEXUS

```bash
python app.py
```

Then open the local address printed by Flask in your browser.

---

## Gameplay Philosophy

NEXUS follows a few rules when designing investigations:

### Don't reveal the answer too early

The player should understand **why** they are running a command.

### Make every command produce evidence

Commands should contribute to the investigation rather than exist only as decoration.

### Let the player get stuck safely

Hints should help without immediately destroying the puzzle.

### Keep the story state authoritative

A player typing a command out of order should not be able to break the narrative.

### Make the interface part of the story

The terminal, notifications, files, logs, and NOVA should all feel like parts of the same operating system.

---

## Roadmap

### Chapter 01

- [x] Machine identity investigation
- [x] Network trace
- [x] NMAP investigation
- [x] Process investigation
- [x] Watcher investigation
- [x] Recovery trace
- [x] Chapter completion sequence

### Future

- [ ] Chapter 02
- [ ] Additional investigation environments
- [ ] More realistic log timelines
- [ ] More evidence interactions
- [ ] Additional terminal commands
- [ ] Expanded NOVA hint system
- [ ] More desktop applications
- [ ] Persistent player progress
- [ ] Additional endings / investigation outcomes

---

## Design Direction

The long-term goal is for NEXUS to feel like a **small operating system that happens to contain a cybersecurity investigation**.

That means the UI should remain coherent across every feature:

- consistent typography
- restrained retro/technical styling
- readable terminal output
- strong hierarchy
- subtle system feedback
- useful animations rather than decorative animation everywhere
- clear evidence states
- NOVA that feels present without becoming intrusive

The visual language should support the investigation instead of competing with it.

---

## Credits

**Created by Abu Bakr**

NEXUS is an independent cybersecurity-learning game/project focused on exploration, investigation, and practical reasoning.

---
