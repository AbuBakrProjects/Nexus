# NOVA Story Guidance Fixes

- Normal NOVA progression describes the next investigation action rather than exposing the terminal command.
- `NEXT:` lines now use natural actions such as `NEXT: Read network.log.` or `NEXT: Look for the Logs folder.`
- The Hint button reveals guidance in three layers: conceptual direction, exact target/action, then the terminal command.
- Terminal file-reading hints consistently use the canonical `cat <file>` syntax.
- Story progression remains server-state driven, so entering a later command early cannot make NOVA skip ahead.
- NOVA reconstructs its current guidance from the evidence/story state after a reload.
