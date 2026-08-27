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
    if not path or path == '.':
        return normalize_path(current_dir)
    if path in ('~', '%USERPROFILE%'):
        return '/home/nexus'
    if path.startswith('~/'):
        return normalize_path('/home/nexus/' + path[2:])
    if path.lower() in ('c:', 'c:/', 'c:\\'):
        return '/'
    if path.startswith('/') or path.startswith('\\'):
        return normalize_path(path)
    return normalize_path(f"{current_dir.rstrip('/')}/{path}")


def visible_filesystem():
    fs = {key: value.copy() for key, value in FILESYSTEM.items()}
    for key, value in fs.items():
        if isinstance(value, dict) and 'children' in value:
            value['children'] = list(value['children'])
    s = game_state
    if not s['network_scan_found']:
        fs['/home/nexus']['children'] = [x for x in fs['/home/nexus']['children'] if x != 'network_trace.txt']
    if not s['watcher_process_found']:
        fs['/home/nexus']['children'] = [x for x in fs['/home/nexus']['children'] if x != 'watcher_note.txt'] if '/home/nexus' in fs else fs['/home/nexus']['children']
    dynamic = {
        '/NEXUS/services': ['nexus-watch.exe', 'watch.conf', 'service.log'] if s['watcher_process_found'] or s['tasklist_found'] else [],
        '/NEXUS/temp': ['session_0316.tmp', 'network_cache.tmp', 'watch_init.tmp'] if s['missing_seconds_found'] else [],
        '/NEXUS/archive': ['watcher_original.conf', 'admin_record.txt'] if s['watcher_log_found'] else [],
    }
    for directory, names in dynamic.items():
        if directory in fs:
            fs[directory]['children'] = list(dict.fromkeys(fs[directory]['children'] + names))
    if s['watcher_modified_found']:
        fs['/NEXUS/services']['children'] = list(dict.fromkeys(fs['/NEXUS/services']['children'] + ['nexus-sync.exe', 'sync.conf']))
    fs['/NEXUS/services/nexus-watch.exe'] = {'type': 'file', 'content': 'NEXUS-WATCH SERVICE'}
    fs['/NEXUS/services/watch.conf'] = {'type': 'file', 'content': 'WATCHER CONFIGURATION\n=====================\n\nMODE: ACTIVE\n\nTARGET: 192.168.1.44\n\nINTERVAL: 30\n\nACTION: MONITOR\n\nSTARTED: 03:17:04\n\nON_ANOMALY:\n    ACTION: ISOLATE'}
    fs['/NEXUS/services/service.log'] = {'type': 'file', 'content': '03:17:04\nWATCHER INITIALIZED\n\n03:17:05\nTARGET REGISTERED\n192.168.1.44\n\n03:17:30\nTARGET STATUS: ONLINE\n\n03:18:00\nTARGET STATUS: ONLINE\n\n03:18:30\nTARGET STATUS: ONLINE\n\n03:19:00\nANOMALY DETECTED\n\n03:19:01\nRESPONSE: NONE\n\n03:19:02\nLOCAL ACTION: ENABLED'}
    fs['/NEXUS/temp/session_0316.tmp'] = {'type': 'file', 'content': 'NEXUS NODE 01\n\nRECOVERY REQUEST\n\nNODE STATUS: COMPROMISED\n\nDO NOT TRUST LOCAL SECURITY SERVICE\n\nREQUEST SOURCE: 192.168.1.44\n\nMESSAGE:\n\nTHE WATCHER IS NOT FOR ME.'}
    fs['/NEXUS/temp/network_cache.tmp'] = {'type': 'file', 'content': 'Network cache: 03:16 activity.'}
    fs['/NEXUS/temp/watch_init.tmp'] = {'type': 'file', 'content': 'Watcher initialization marker.'}
    fs['/NEXUS/archive/watcher_original.conf'] = {'type': 'file', 'content': 'NEXUS-WATCH ORIGINAL CONFIGURATION\n\nTARGET: [NONE]\n\nMODE: PASSIVE\n\nACTION: LOG_ONLY\n\nAUTHORIZED BY:\nA.B.\n\nDATE:\nUNKNOWN'}
    fs['/NEXUS/archive/admin_record.txt'] = {'type': 'file', 'content': 'NEXUS ADMINISTRATIVE RECORD\n\nAUTHORIZED OPERATOR:\nABUBAKR\n\nROLE:\nSYSTEM ARCHITECT\n\nACCESS:\nROOT\n\nSTATUS:\nREVOKED'}
    fs['/NEXUS/services/nexus-sync.exe'] = {'type': 'file', 'content': 'NEXUS SYNC SERVICE'}
    fs['/NEXUS/services/sync.conf'] = {'type': 'file', 'content': 'NEXUS SYNC SERVICE\n\nREMOTE:\n192.168.1.44\n\nMODE:\nRECOVERY\n\nSOURCE:\nNODE 01\n\nAUTH:\nLOCAL SYSTEM\n\nPURPOSE:\nUNKNOWN'}
    return fs


def find_case_path(fs, target):
    if target in fs:
        return target
    wanted = target.lower().rstrip('/') or '/'
    for key in fs:
        if key.lower().rstrip('/') == wanted:
            return key
    return None


def result(output='', cwd='/home/nexus', **extra):
    return {'output': output, 'cwd': cwd, **extra}


def command_error(message, current_dir, tip=None):
    return result(message + (f"\nHint: {tip}" if tip else ''), current_dir, educational=True)


def run_story_hook(command, target=''):
    if game_state['current_challenge'] == 1:
        return run_challenge01(command, target)
    if game_state['current_challenge'] == 2:
        return run_challenge02(command, target)
    return run_challenge03(command, target)


def execute_command(command, current_dir):
    command = str(command or '').strip()
    current_dir = normalize_path(current_dir or '/home/nexus')
    fs = visible_filesystem()
    current_dir = find_case_path(fs, current_dir) or '/home/nexus'
    if current_dir not in fs or fs[current_dir]['type'] != 'directory':
        current_dir = '/home/nexus'
    if not command:
        return result(cwd=current_dir)
    parts = command.split()
    cmd, args = parts[0].lower(), parts[1:]
    game_state['commands_used'].append(command)

    if cmd == 'help':
        return result('\n'.join(['Available commands:', '', 'help       Show available commands', 'clear      Clear terminal', 'pwd        Show current directory', 'ls         List files', 'dir        List files', 'cd         Change directory', 'cat        Read a file', 'type       Read a file', 'nmap       Scan a network node', 'ps         List running processes', 'tasklist   List Windows processes', 'netstat    Show network connections', 'whoami     Show current user', 'hostname   Show system hostname', 'ipconfig   Show network configuration', 'net user   List local user accounts', 'wmic       Query process information', 'connect    Simulate a connection', 'echo       Print text', 'date       Show system date']), current_dir)
    if cmd == 'pwd':
        return result(current_dir, current_dir)
    if cmd == 'whoami':
        hook = run_story_hook(command)
        return result('nexus\\operator', current_dir, challenge_complete=hook['complete'], notification=hook['notification'])
    if cmd == 'hostname':
        hook = run_story_hook(command)
        return result('NEXUS-NODE-01', current_dir, challenge_complete=hook['complete'], notification=hook['notification'])
    if cmd == 'ipconfig':
        hook = run_story_hook(command)
        output = 'Windows IP Configuration\n\nEthernet adapter NEXUS:\n\n   IPv4 Address............. 192.168.1.24\n   Subnet Mask.............. 255.255.255.0\n   Default Gateway..........192.168.1.1'
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])
    if cmd == 'date':
        return result(datetime.now().strftime('%a %b %d %H:%M:%S %Y'), current_dir)
    if cmd == 'echo':
        return result(' '.join(args), current_dir)
    if cmd == 'clear':
        return result('__CLEAR__', current_dir)

    if cmd in ('ls', 'dir'):
        paths = [arg for arg in args if not arg.startswith('-')]
        if len(paths) > 1:
            return command_error('ls: multiple paths are not supported in this terminal', current_dir, 'Try one path at a time.')
        target = resolve_path(current_dir, paths[0]) if paths else current_dir
        if cmd == 'dir' and not paths and game_state['ipconfig_found'] and current_dir == '/home/nexus':
            target = '/'
        target = find_case_path(fs, target)
        if not target or target not in fs:
            shown = paths[0] if paths else target
            return command_error(f"ls: cannot access '{shown}': No such file or directory", current_dir, 'Check your path with pwd, then try ls or dir.')
        item = fs[target]
        if item['type'] == 'file':
            return result(target, current_dir)
        hook = run_story_hook(command, target)
        children = item.get('children', [])
        if cmd == 'dir':
            display = ' Volume in drive C is NEXUS\n\n Directory of C:\\' + ('' if target == '/' else target.replace('/', '\\').lstrip('\\')) + '\n\n' + '\n'.join(f'08/26/2026  01:02 AM    <DIR>          {x}' if fs.get((target.rstrip('/') + '/' + x) if target != '/' else '/' + x, {}).get('type') == 'directory' else f'08/26/2026  01:02 AM             1,024  {x}' for x in children) + f'\n\n               {len(children)} Item(s)'
        else:
            display = '\n'.join(children)
        return result(display, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'cd':
        if len(args) > 1:
            return command_error('cd: too many arguments', current_dir, 'cd accepts one destination.')
        target_arg = args[0] if args else '~'
        target = find_case_path(fs, resolve_path(current_dir, target_arg))
        if not target and current_dir == '/home/nexus' and target_arg.lower() in ('logs', 'etc', 'nexus'):
            target = find_case_path(fs, '/' + target_arg)
        if not target or target not in fs:
            return command_error(f'cd: no such file or directory: {target_arg}', current_dir, 'Use ls or dir to see available folders.')
        if fs[target]['type'] != 'directory':
            return command_error(f'cd: not a directory: {target_arg}', current_dir, 'Use type/cat to read files; cd only enters folders.')
        hook = run_story_hook(command, target)
        return result('', target, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd in ('cat', 'type'):
        if not args:
            return command_error(f'{cmd}: missing file operand', current_dir, 'Give the filename you want to read.')
        raw_target = ' '.join(args)
        target = find_case_path(fs, resolve_path(current_dir, raw_target))
        if not target or target not in fs:
            return command_error(f'{cmd}: {raw_target}: No such file or directory', current_dir, 'Use ls or dir to find the exact filename.')
        if fs[target]['type'] != 'file':
            return command_error(f'{cmd}: {raw_target}: Is a directory', current_dir, 'Use ls or dir to inspect folders.')
        hook = run_story_hook(command, target)
        return result(fs[target]['content'], current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'nmap':
        if len(args) != 1:
            return command_error('nmap: usage: nmap <target>', current_dir, 'Try the suspicious address you found in the logs.')
        target = args[0]
        if target != '192.168.1.44':
            return result(f'Starting Nmap 7.94 simulation...\nHost: {target}\nStatus: down or outside the local node.', current_dir)
        hook = run_story_hook(command)
        output = 'Nmap scan report for 192.168.1.44\n\nPORT      STATE     SERVICE\n22/tcp    open      ssh\n80/tcp    open      http\n443/tcp   open      https\n\nNmap done.'
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd in ('ps', 'tasklist'):
        hook = run_story_hook(command)
        if cmd == 'tasklist':
            output = 'Image Name                     PID\n========================= ========\nSystem                         4\nsvchost.exe                   812\nexplorer.exe                 2148\nnexus-core.exe               2916\nnexus-ui.exe                 3044\nnexus-watch.exe              3172' + ('\nnexus-sync.exe               4021' if game_state['watcher_modified_found'] else '')
        else:
            output = 'PID   USER    NAME\n1     root    nexus-init\n214   nexus   desktop-session\n318   nexus   nova-agent\n417   root    nexus-watch --audit=network\n502   nexus   terminal' + ('\n4021  root    nexus-sync --recovery' if game_state['watcher_modified_found'] else '')
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'netstat':
        if args not in ([], ['-ano']):
            return command_error('netstat: unsupported option', current_dir, 'Try netstat or netstat -ano.')
        hook = run_story_hook(command, 'netstat')
        if args == ['-ano']:
            output = 'Active Connections\n\nProto    Local Address        Foreign Address       State        PID\nTCP      192.168.1.24:443     192.168.1.44:51231    ESTABLISHED  3172' + ('\nTCP      192.168.1.24:52172   192.168.1.44:443      ESTABLISHED  4021' if game_state['sync_process_found'] else '')
        else:
            output = 'Active Connections\n\nProto    Local Address        Foreign Address       State\nTCP      192.168.1.24:443     192.168.1.44:51231    ESTABLISHED\nTCP      192.168.1.24:52144   192.168.1.1:53        ESTABLISHED'
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'net' and args[:1] == ['user']:
        hook = run_story_hook(command, 'net user')
        output = 'User accounts for \\NEXUS-NODE-01\n\n----------------------------------\nAdministrator\nGuest\noperator\nNOVA-Service'
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'wmic':
        hook = run_story_hook(command, 'wmic')
        if 'nexus-watch' in command.lower():
            output = 'ExecutablePath\nC:\\NEXUS\\services\\nexus-watch.exe\n\nProcessId\n3172'
        else:
            output = 'WMIC process query completed.\nUse the process name to request ProcessId and ExecutablePath.'
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    if cmd == 'connect' and args == ['192.168.1.44']:
        hook = run_story_hook(command)
        output = "REMOTE CONNECTION DETECTED\n\n192.168.1.44\n\nINCOMING MESSAGE\n\nYou finally found the real connection.\n\nDon't look for me.\n\nLook for what NEXUS was trying to recover.\n\n03:17 was not the beginning.\n\nCONNECTION CLOSED"
        return result(output, current_dir, challenge_complete=hook['complete'], notification=hook['notification'])

    return command_error(f"{cmd}: command not found\nType 'help' for available commands.", current_dir, 'Use help if you are unsure what the terminal can do.')
