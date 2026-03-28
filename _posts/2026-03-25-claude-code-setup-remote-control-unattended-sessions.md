---
layout: post
title: "My Claude Code Setup: Fixing Remote Control and Running Unattended Sessions"
author: jkfran
categories: [tools]
image: https://github.com/jkfran/jkfran.com/releases/download/blog-images/claude-remote-control.jpg
---

Claude Code's `/remote-control` is one of those features that sounds life-changing — start a task at your desk, walk away, keep working from your phone. And it _is_ life-changing, until the connection silently dies after 15–60 minutes and never recovers. The status bar shows "Remote Control reconnecting" indefinitely, and your only option is to manually cycle `/remote-control` at the terminal. Which, of course, defeats the entire purpose of remote control.

This is a known issue ([anthropics/claude-code#34255](https://github.com/anthropics/claude-code/issues/34255)), and there's a community tool called **claude-remote-watchdog** that auto-detects and fixes dead sessions. But getting it working properly has some gotchas nobody tells you about. Here's the complete walkthrough, including every pitfall I hit along the way.

---

## What You Need

- **Claude Code** CLI (Pro or Max plan)
- **tmux** — your Claude Code sessions must run inside tmux for the watchdog to see them
- **macOS or Linux** (this guide uses macOS with Homebrew)

---

## Step 1: Install tmux

If you don't have it:

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# Fedora
sudo dnf install tmux
```

Verify it's installed:

```bash
which tmux
```

You should see something like `/opt/homebrew/bin/tmux`.

---

## Step 2: Run Claude Code Inside tmux

This is the critical part. The watchdog reads tmux pane content to detect stuck sessions. If Claude Code isn't running inside tmux, the watchdog has nothing to scan.

```bash
tmux new -s life
```

You'll see a tmux status bar at the bottom of your terminal. Now launch Claude Code inside this session as you normally would.

That's it — you're now running Claude Code inside a tmux pane.

**Quick tmux survival guide:**

- `Ctrl+B` then `D` — detach (session keeps running in background)
- `tmux attach -t life` — reattach to your session
- `tmux ls` — list sessions
- `Ctrl+B` then `C` — new window inside the session

---

## Step 3: Install the Watchdog

```bash
git clone https://github.com/sma1lboy/claude-remote-watchdog.git
cd claude-remote-watchdog
./install.sh
```

This creates symlinks in `~/.claude/`:

- `~/.claude/commands/remote-watchdog.md` — slash command
- `~/.claude/scripts/remote-watchdog.sh` — the actual watchdog script

Test it manually:

```bash
~/.claude/scripts/remote-watchdog.sh
```

You should see something like:

```
=== Remote Control Watchdog 22:05:42 ===
[HEALTHY] claude (%0)
[OK] All Remote Control sessions healthy
```

If you see `[SKIP] No Remote Control sessions found`, make sure you have `/remote-control` active inside your tmux session.

The install also adds a `/remote-watchdog` slash command you can run inside Claude Code. It's nice to have for manual checks, but I went with the cronjob approach below for fully unattended recovery.

---

## Step 4: Set Up Cron (The Right Way)

Use crontab to run the watchdog every 5 minutes, completely outside Claude Code:

```bash
crontab -e
```

**Important:** Add a `PATH` line before the cron entry. Cron runs with a minimal PATH that doesn't include `/opt/homebrew/bin`, so it can't find `tmux`. Without this, the watchdog will run but report `[SKIP]` every single time because it literally cannot execute the `tmux` commands it needs.

```
PATH=/opt/homebrew/bin:/usr/bin:/bin
*/5 * * * * ~/.claude/scripts/remote-watchdog.sh >> /tmp/remote-watchdog.log 2>&1
```

If you've never used crontab before, you'll see:

```
crontab: no crontab for yourname - using an empty one
crontab: installing new crontab
```

That's normal. It created a fresh crontab with your entry.

---

## Step 5: Disable the Update Banner

This is the second gotcha that took a while to figure out. Claude Code shows an "Update available! Run: brew upgrade claude-code" banner in the status area — the same area where the Remote Control status normally appears. When this banner is showing, the watchdog captures that text instead of the Remote Control status, so it reports `[SKIP]` even though your session is right there.

The fix is to set `DISABLE_AUTOUPDATER=1`. More on where to put this below.

---

## Step 6: Set Up Your Shell Alias

By now you probably want a quick command that launches Claude Code with all the right settings. Add this to your `~/.zshrc`:

```bash
c() { DISABLE_AUTOUPDATER=1 claude --effort max --dangerously-skip-permissions "$@"; }
```

Then reload:

```bash
source ~/.zshrc
```

Now `c` gives you:

- **`DISABLE_AUTOUPDATER=1`** — kills the update banner so the watchdog can see the status bar
- **`--effort max`** — maximum reasoning depth (Opus only)
- **`--dangerously-skip-permissions`** — no permission prompts for every command
- **`"$@"`** — passes through any extra arguments, so `c -c` continues your last session

---

## Step 7: Skip the Safety Confirmation

When you run `--dangerously-skip-permissions`, Claude Code shows a scary warning and asks you to confirm. To skip it, add this to `~/.claude/settings.json`:

```json
{
  "skipDangerousModePermissionPrompt": true
}
```

If you already have settings in that file, just add the key to the existing JSON.

---

## Step 8: Enable Remote Control by Default

So you don't have to type `/remote-control` every time you start a session, run `/config` inside Claude Code and set **"Enable Remote Control for all sessions"** to true. Every new Claude Code session will automatically start with Remote Control active.

---

## Checking the Logs

Your watchdog logs to `/tmp/remote-watchdog.log`. Check it anytime:

```bash
# Last few entries
tail -20 /tmp/remote-watchdog.log

# Follow live
tail -f /tmp/remote-watchdog.log
```

A healthy log looks like:

```
=== Remote Control Watchdog 13:40:00 ===
[WARN] claude (%1): 'reconnecting' — confirming next check
=== Remote Control Watchdog 13:45:00 ===
[DEAD] claude (%1): stuck on 'reconnecting' — auto-reconnecting
[ACTION] Cycling /remote-control on pane %1 (claude)...
[OK] Reconnect sequence sent to pane %1 (claude)
```

The watchdog uses a 2-check grace period — `[WARN]` on first detection, `[DEAD]` and auto-reconnect on the second. This avoids false positives on transient drops.

---

## How the Fix Actually Works

When the watchdog detects a stuck session, it sends tmux keystrokes to cycle the `/remote-control` menu:

1. `Ctrl+C` to clear the prompt
2. Types `/remote-control` which opens the TUI menu
3. Navigates to "Disconnect this session" and presses Enter
4. Types `/remote-control` again, which auto-connects to a fresh bridge

Your actual Claude Code session — with its full conversation history — never stops. Only the remote bridge gets cycled. Think of it like unplugging and re-plugging a cable.

---

## Known Issue: Effort Level "max" Doesn't Persist

If you set `"effortLevel": "max"` in `settings.json`, it gets silently downgraded to "high" when you interact with the `/model` UI. This is a known bug. The workaround is using the `--effort max` CLI flag every time, which is why we put it in the shell alias above.

---

## The Complete Setup Checklist

1. Install tmux (`brew install tmux`)
2. Start Claude Code inside tmux (`tmux new -s life`, then launch Claude)
3. Install the watchdog (`git clone` + `./install.sh`)
4. Set up crontab with the correct PATH
5. Disable the update banner (`DISABLE_AUTOUPDATER=1`)
6. Add the shell alias to `~/.zshrc`
7. Skip the safety confirmation in `~/.claude/settings.json`
8. Enable Remote Control for all sessions via `/config`

---

## Quick Reference

| What                         | Command                                |
| ---------------------------- | -------------------------------------- |
| Start Claude with everything | `c` (or `c -c` to continue)            |
| Check watchdog logs          | `tail -20 /tmp/remote-watchdog.log`    |
| Run watchdog manually        | `~/.claude/scripts/remote-watchdog.sh` |
| Check crontab                | `crontab -l`                           |
| Check tmux sessions          | `tmux ls`                              |
| Attach to tmux               | `tmux attach -t life`                  |
| Detach from tmux             | `Ctrl+B` then `D`                      |

---

Remote Control is genuinely useful when it works — start a task on your laptop, continue from your phone on the couch. The connection bug makes it unreliable, but with this watchdog setup, the dead sessions get automatically revived without you lifting a finger. Set it up once and forget about it.
