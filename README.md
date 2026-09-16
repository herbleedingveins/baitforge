# BaitForge

Production-ready Discord audio bot for combining front/end bait clips with user audio.

## Features

- **Secure token management** - Never hardcoded, read from environment only
- **Owner-only bait management** - `/front` and `/end` commands restricted to owner
- **Public audio processing** - Everyone can use `/bait` and `/loud`
- **Channel restriction** - All commands work only in designated channel
- **FFmpeg integration** - Combines audio with loudness boost and peak protection
- **SQLite persistence** - Bait clips survive bot restarts
- **Per-user loudness** - `/loud` command stores 0-18 dB boost per user
- **Discord slash commands** - Full v14 support
- **Comprehensive logging** - Secrets never logged

## Setup

### Prerequisites

- Node.js 18+
- FFmpeg installed and in PATH
- Discord Application (already created, ID: 1549619187398352997)
- Bot token (must be newly reset)

### Installation

1. **Clone and install**
```bash
cd baitforge
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
DISCORD_TOKEN=your_newly_reset_token
APPLICATION_ID=1549619187398352997
OWNER_USER_ID=your_user_id
ALLOWED_CHANNEL_ID=1549621880846164069
```

3. **Build**
```bash
npm run build
```

4. **Register commands**
```bash
npm run register-commands
```

5. **Start**
```bash
npm start
```

## Commands

### `/front name audio` (Owner Only)
Add a front bait clip. Must be in allowed channel.

### `/end name audio` (Owner Only)
Add an end bait clip. Must be in allowed channel.

### `/loud boost` (Everyone)
Set loudness for next bait job (0-18 dB). Must be in allowed channel.
- Stores per-user setting
- Cleared after each bait job

### `/bait` (Everyone)
Create forged audio:
1. Select front bait
2. Upload main audio
3. Select end bait
4. Review settings
5. Process (combines front → main → end)
6. Result posted publicly

## Security

- **No hardcoded tokens** - Read from `DISCORD_TOKEN` env only
- **No token in logs** - All secrets redacted in logging
- **No token in source** - `.env` is gitignored, `.env.example` is public
- **Authenticated interactions** - Uses `interaction.user.id`, never trusts user-supplied IDs
- **Channel enforcement** - All commands check `ALLOWED_CHANNEL_ID`
- **Owner verification** - /front and /end check `OWNER_USER_ID`

## Database

SQLite at `./baitforge.db` with tables:
- `baits` - Front/end clips with metadata
- `user_loudness` - Per-user loudness settings
- `processing_jobs` - Job history and status

## Audio Processing

FFmpeg workflow:
1. Concatenate: front → main → end
2. Apply volume boost (0-18 dB)
3. Limiter and normalization for peak protection
4. Output to MP3 (192k, 44.1kHz stereo)

## Logging

Structured JSON logging with secret redaction.

Production (no pino-pretty):
```bash
NODE_ENV=production npm start
```

Development (colorized):
```bash
NODE_ENV=development npm start
```

## Testing

```bash
npm test
```

## Deployment

### Docker

```bash
docker build -t baitforge .
docker run --env-file .env baitforge
```

### Railway / Render

1. Connect GitHub repo
2. Set environment variables (never paste token)
3. Deploy

## Made by slurz

All audio embeds credit "Made by slurz · BaitForge"
