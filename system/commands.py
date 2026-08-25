from datetime import datetime
from challenges.challenge01 import run_challenge01
from challenges.challenge02 import run_challenge02
from challenges.challenge03 import run_challenge03
from system.filesystem import FILESYSTEM
from system.state import game_state


def normalize_path(path):
    parts = []
    for part in str(path).replace('\\', '/').split('/'):
        if part in ('', '.'):
            continue
        if part == '..':
            if parts:
                parts.pop()
            continue
        parts.append(part)
    return '/' + '/'.join(parts) if parts else '/'


def resolve_path(current_dir, path):
    path = str(path).strip()
    if path in ('', '.'):
        return normalize_path(current_dir)
    if path == '~':
        return '/home/nexus'
    if path.startswith('~/'):
        return normalize_path('/home/nexus/' + path[2:])
    if path.startswith('/'):
        return normalize_path(path)
    return normalize_path(f"{current_dir.rstrip('/')}/{path}")


def visible_filesystem():
    fs = {key: value.copy() for key, value in FILESYSTEM.items()}
    for key in fs:
        if isinstance(fs[key], dict) and 'children' in fs[key]:
            fs[key]['children'] = list(fs[key]['children'])
    if not game_state['network_scan_found'] and '/home/nexus/network_trace.txt' in fs:
        fs['/home/nexus']['children'].remove('network_trace.txt')
        fs.pop('/home/nexus/network_trace.txt', None)
    if not game_state['watcher_process_found'] and '/home/nexus/watcher_note.txt' in fs:
        fs['/home/nexus']['children'].remove('watcher_note.txt')
        fs.pop('/home/nexus/watcher_note.txt', None)
    return fs


def result(output='', cwd='/home/nexus', **extra):
    return {'output': output, 'cwd': cwd, **extra}


def command_error(message, current_dir, tip=None):
    return result(message + (f"\nHint: {tip}" if tip else ''), current_dir, educational=True)


def execute_command(command, current_dir):
    command = str(command or '').strip()
    current_dir = normalize_path(current_dir or '/home/nexus')
    fs = visible_filesystem()
    if current_dir not in fs or fs[current_dir]['type'] != 'directory':
        current_dir = '/home/nexus'
    if not command:
        return result(cwd=current_dir)

    parts = command.split()
    cmd, args = parts[0].lower(), parts[1:]
    game_state['commands_used'].append(cmd)

    if cmd == 'help':
        return result('\n'.join(['Available commands:', '', 'help       Show available commands', 'clear      Clear terminal', 'pwd        Show current directory', 'ls         List files', 'cd         Change directory', 'cat        Read a file', 'nmap       Scan a network node', 'ps         List running processes', 'netstat    Show network connections', 'whoami     Show current user', 'hostname   Show system hostname', 'echo       Print text', 'date       Show system date']), current_dir)
    if cmd == 'pwd':
        return result(current_dir, current_dir)
    if cmd == 'whoami':
        return result('nexus', current_dir)
    if cmd == 'hostname':
        return result('nexus-node-01', current_dir)
    if cmd == 'date':
        return result(datetime.now().strftime('%a %b %d %H:%M:%S %Y'), current_dir)
    if cmd == 'echo':
        return result(' '.join(args), current_dir)
    if cmd == 'clear':
        return result('__CLEAR__', current_dir)

    if cmd == 'ls':
        flags = [arg for arg in args if arg.startswith('-') and arg != '-']
        paths = [arg for arg in args if not arg.startswith('-')]
        if len(paths) > 1:
            return command_error(
                'ls: multiple paths are not supported in this terminal',
                current_dir,
                'Try one path at a time, for example: ls /logs'
            )
        target = resolve_path(current_dir, paths[0]) if paths else current_dir
        item = fs.get(target)
        if not item:
            shown = paths[0] if paths else target
            return command_error(
                f"ls: cannot access '{shown}': No such file or directory",
                current_dir,
                'Check your path with pwd, then try ls or ls /'
            )
        if item['type'] == 'file':
            return result(target, current_dir)
        children = item.get('children', [])
        if 'l' in ''.join(flags):
            lines = []
            for child in children:
                child_path = f"{target.rstrip('/')}/{child}" if target != '/' else f"/{child}"
                child_item = fs.get(child_path, {})
                marker = 'd' if child_item.get('type') == 'directory' else '-'
                lines.append(f"{marker}rw-r--r--  nexus  nexus  {child}")
            return result('\n'.join(lines), current_dir)
        return result('\n'.join(children), current_dir)

    if cmd == 'cd':
        if len(args) > 1:
            return command_error(
                'cd: too many arguments',
                current_dir,
                'cd accepts one destination. Use cd .. to move up.'
            )
        target_arg = args[0] if args else '~'
        target = resolve_path(current_dir, target_arg)
        item = fs.get(target)
        if not item:
            return command_error(f"cd: no such file or directory: {target_arg}", current_dir, 'Use ls to see available folders. Relative paths start from your current directory.')
        if item['type'] != 'directory':
            return command_error(f"cd: not a directory: {target_arg}", current_dir, 'Use cat to read files; use cd only with folders.')
        return result('', target)

    if cmd == 'cat':
        if not args:
            return command_error(
                'cat: missing file operand',
                current_dir,
                'cat reads a file. Try cat /logs/access.log'
            )
        if len(args) > 1:
            return command_error(
                'cat: multiple files are not supported in this terminal',
                current_dir,
                'Read one file at a time.'
            )
        target = resolve_path(current_dir, args[0])
        item = fs.get(target)
        if not item:
            return command_error(
                f'cat: {args[0]}: No such file or directory',
                current_dir,
                'Use ls to find the exact filename.'
            )
        if item['type'] != 'file':
            return command_error(
                f'cat: {args[0]}: Is a directory',
                current_dir,
                'Use ls to inspect a directory, then cat one of its files.'
            )
        if target == '/home/nexus/network_trace.txt' and game_state['network_scan_found']:
            return result(item['content'], current_dir)
        if target == '/home/nexus/watcher_note.txt' and game_state['watcher_process_found']:
            return result(item['content'], current_dir)
        if game_state['current_challenge'] == 1:
            challenge_result = run_challenge01(command, target)
        elif game_state['current_challenge'] == 2:
            challenge_result = run_challenge02(command, target)
        else:
            challenge_result = run_challenge03(command, target)
        return result(item['content'], current_dir, challenge_complete=challenge_result['complete'], notification=challenge_result['notification'])

    if cmd == 'nmap':
        if len(args) != 1:
            return command_error(
                'nmap: usage: nmap <target>',
                current_dir,
                'For the investigation, you already know one address worth checking.'
            )
        target = args[0]
        if target != '192.168.1.44':
            return result(f'Starting Nmap 7.94 simulation...\nHost: {target}\nStatus: down or outside the local node.', current_dir, educational=True)
        challenge_result = run_challenge02(command, '')
        output = 'Starting Nmap 7.94 simulation...\nHost: 192.168.1.44\nStatus: up\n\nPORT     STATE  SERVICE\n22/tcp   open   ssh\n80/tcp   open   http\n443/tcp  open   https\n\nOS guess: unknown\nScan complete.'
        return result(output, current_dir, challenge_complete=challenge_result['complete'], notification=challenge_result['notification'])

    if cmd == 'ps':
        if args:
            return command_error(
                'ps: options are not supported in this terminal',
                current_dir,
                'Try plain ps first.'
            )
        challenge_result = run_challenge03(command, '')
        output = 'PID   USER    NAME\n1     root    nexus-init\n214   nexus   desktop-session\n318   nexus   nova-agent\n417   root    nexus-watch --audit=network\n502   nexus   terminal'
        return result(output, current_dir, challenge_complete=challenge_result['complete'], notification=challenge_result['notification'])

    if cmd == 'netstat':
        if args:
            return command_error(
                'netstat: options are not supported in this terminal',
                current_dir,
                'Try plain netstat first.'
            )
        challenge_result = run_challenge03(command, '')
        output = 'Active connections\n\nProto  Local Address          Foreign Address        State\ntcp    192.168.1.24:22       192.168.1.44:51122     ESTABLISHED\ntcp    192.168.1.24:443      192.168.1.44:443       ESTABLISHED\ntcp    127.0.0.1:9000       127.0.0.1:9001         LISTENING'
        return result(output, current_dir, challenge_complete=challenge_result['complete'], notification=challenge_result['notification'])

    return command_error(
        f"{cmd}: command not found\nType 'help' for available commands.",
        current_dir,
        'Use help if you are unsure what the terminal can do.'
    )
