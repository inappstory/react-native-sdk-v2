# Agent instructions

This file is the single source of truth for AI coding agents working in this repo (Claude Code, Codex, Cursor, etc).

## Vendor folders are generated

`.claude/`, `.codex/`, `.cursor/` are compiled from [.agents/](.agents/) by [.agents/setup](.agents/setup) and are gitignored. Don't edit them directly — edit the matching subfolder under `.agents/` and run `.agents/setup` (this also runs automatically on session start).
