from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
OUTPUT_FILE = PROJECT_ROOT / "project_code.txt"
EXTENSIONS = {".html", ".css", ".js", ".py"}
EXCLUDED_DIRS = {".git", "__pycache__", "venv", ".venv", "node_modules"}


def should_include(path):
    return path.suffix.lower() in EXTENSIONS and not any(part in EXCLUDED_DIRS for part in path.parts)


def main():
    files = sorted(path for path in PROJECT_ROOT.rglob("*") if path.is_file() and should_include(path))
    with OUTPUT_FILE.open("w", encoding="utf-8") as output:
        output.write("NEXUS OS PROJECT FILES\n")
        output.write("=" * 80 + "\n\n")
        for path in files:
            relative_path = path.relative_to(PROJECT_ROOT)
            output.write("=" * 80 + "\n")
            output.write(f"FILE: {relative_path}\n")
            output.write("=" * 80 + "\n\n")
            try:
                output.write(path.read_text(encoding="utf-8", errors="replace"))
                output.write("\n")
            except Exception as error:
                output.write(f"[Could not read file: {error}]\n")
    print(f"Exported {len(files)} files.")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
