# BaitForge Quick Start

## What You Get

A **production-ready Discord bot** that:
- Lets the owner add front/end audio clips via `/front` and `/end`
- Lets everyone create forged audio via `/bait` (front + user audio + end)
- Controls loudness per user via `/loud` (0-18 dB)
- Sends results publicly with full metadata
- Never exposes the bot token
- Enforces channel and permission restrictions
- Stores baits permanently (SQLite)
- Cleans up temporary files automatically

---

## 5-Minute Setup

### 1. Reset Your Discord Bot Token

⚠️ **CRITICAL**: The previous token was exposed and **must not be used**.

1. Go to: https://discord.com/developers/applications/1549619187398352997
2. Click **Bot** in sidebar
3. Under **TOKEN**, click **Reset Token**
4. **Copy immediately** (you won't see it again)
5. **Never paste it in chat or commit it**

### 2. Clone & Setup

```bash
cd baitforge
cp .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=paste_your_newly_reset_token_here
OWNER_USER_ID=your_discord_user_id
```

Get your user ID:
- Enable Developer Mode in Discord settings
- Right-click your name → Copy User ID
- Paste in `.env`

### 3. Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows - download from ffmpeg.org or:
choco install ffmpeg
```

### 4. Install & Run

```bash
npm install
npm run build
npm run register-commands
npm start
```

You should see:
```
Initializing BaitForge bot...
Database initialized at ./baitforge.db
Loaded command: front
Loaded command: end
Loaded command: loud
Loaded command: bait
Bot is online (username: BaitForge, ...)
```

### 5. Test in Discord

In channel `#audio` (1549621880846164069):

```
/loud boost:6
```

Bot replies:
```
🔊 Loudness updated
Your next /bait job will use +6 dB.
```

✅ **Bot is working!**

---

## Next Steps

### Add Your First Bait (Owner Only)

```
/front name:intro audio:my-intro.mp3
```

Bot downloads, analyzes, and stores it.

```
/end name:outro audio:my-outro.mp3
```

Now users can forge audio.

### Use /bait as a User

```
/bait
```

Step-by-step:
1. Select front bait
2. Upload your main audio
3. Select end bait
4. Review + Process
5. Result posted publicly

---

## File Structure

```
baitforge/
├── src/
│   ├── index.ts              # Bot entry point
│   ├── config.ts             # Environment config
│   ├── commands/             # /front /end /loud /bait
│   ├── audio/                # FFmpeg processing
│   ├── storage/              # Database & persistence
│   ├── security/             # Permission checks
│   └── embeds/               # Discord embeds
├── dist/                      # Compiled output (run npm build)
├── baitforge.db              # SQLite database (auto-created)
├── storage/                  # Audio files (auto-created)
├── .env                      # Your secrets (gitignored)
├── .env.example              # Template (safe to commit)
└── package.json
```

---

## Commands Reference

### `/front name audio` — Add Front Bait (Owner)
- Name: clip name ("intro", "hello", etc)
- Audio: MP3/WAV/M4A/OGG/FLAC file
- Max 25 MB
- Owner only, allowed channel only

### `/end name audio` — Add End Bait (Owner)
- Same as `/front`, stores in end-bait list

### `/loud boost` — Set Loudness (Everyone)
- boost: 0-18 (dB)
- Stores per-user, cleared after next /bait job
- Allowed channel only

### `/bait` — Create Forged Audio (Everyone)
- Multi-step wizard
- Front bait selection
- Main audio upload
- End bait selection
- Processing with selected loudness
- Result posted publicly
- Allowed channel only

---

## Security Checklist

- ✅ Token read from `DISCORD_TOKEN` env only
- ✅ Token never logged or committed
- ✅ `.env` is gitignored
- ✅ Permission checks on every command
- ✅ Owner ID from `OWNER_USER_ID` env
- ✅ Channel ID from `ALLOWED_CHANNEL_ID` env
- ✅ Authenticated user ID from Discord interaction (not user-supplied)
- ✅ File validation before processing
- ✅ Temporary files cleaned up
- ✅ Secrets redacted in logs

---

## Deployment

### Local (Testing)
```bash
npm run dev  # Watch mode
```

### Docker
```bash
npm run build
docker build -t baitforge .
docker run --env-file .env baitforge
```

### Railway / Render
1. Connect GitHub repo
2. Set environment variables (no .env file!)
3. Deploy

See `DEPLOYMENT.md` for Railway, Render, Fly.io, VPS, and more.

---

## Troubleshooting

### "Missing DISCORD_TOKEN"
```bash
# Make sure .env exists
ls -la .env

# And contains token
grep DISCORD_TOKEN .env
```

### "Cannot find ffmpeg"
```bash
which ffmpeg
ffmpeg -version  # Should work
```

### "Bot not responding"
1. Check bot is online: look for bot in member list
2. Check logs: `npm start` shows any errors
3. Verify you're in channel `1549621880846164069`
4. Verify bot has Send Messages permission

### "Database locked"
Close other bot instances:
```bash
ps aux | grep node
kill -9 <pid>
```

---

## What Requires Your Input

1. **DISCORD_TOKEN** — Reset via Discord developer panel
2. **OWNER_USER_ID** — Your Discord user ID (get via Developer Mode)
3. **Hosting** — Run locally, Docker, or cloud platform
4. **FFmpeg** — Install on your system or in Docker image
5. **Front/End Baits** — Owner uploads audio clips

## What's Pre-Configured

- ✅ Application ID: `1549619187398352997`
- ✅ Allowed Channel: `1549621880846164069`
- ✅ Max Upload: 25 MB
- ✅ Max Loudness: 18 dB
- ✅ Output Format: MP3
- ✅ Database: SQLite
- ✅ FFmpeg Codec: libmp3lame
- ✅ All slash commands
- ✅ Permission system
- ✅ Error handling
- ✅ Logging system

---

## Documentation

- **README.md** — Overview and features
- **DEPLOYMENT.md** — Cloud, Docker, VPS deployment
- **ARCHITECTURE.md** — Code structure and data flow
- **TESTING.md** — Testing checklist
- **SECURITY.md** — Security practices

---

## Support

If something breaks:

1. Check logs: `npm start` shows errors
2. Read DEPLOYMENT.md troubleshooting section
3. Verify .env is correct
4. Verify FFmpeg is installed
5. Check Discord permissions

---

## Made by slurz

All audio embeds credit "Made by slurz · BaitForge"
