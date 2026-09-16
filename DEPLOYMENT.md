# Deployment Guide

## Discord Setup

### Create Application (Already Done)

Your application ID is: `1549619187398352997`

### Reset Bot Token (CRITICAL)

The previous token was exposed and **must not be used**.

1. Go to https://discord.com/developers/applications/1549619187398352997
2. Click "Bot" in the sidebar
3. Under TOKEN, click "Reset Token"
4. Copy the new token immediately
5. **Never paste it in chat or commits**

### Configure Bot Permissions

1. Go to OAuth2 → URL Generator
2. Scopes: `bot`, `applications.commands`
3. Permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Manage Messages (optional, for cleanup)
4. Copy generated URL

### Invite Bot to Server

Use the generated URL to invite bot to your server.

Or use this template with your app ID:
```
https://discord.com/api/oauth2/authorize?client_id=1549619187398352997&permissions=2048&scope=bot%20applications.commands
```

## Local Setup

### 1. Install Dependencies

```bash
# Install Node 18+
node --version  # Check >= 18.0.0

# Install FFmpeg
# macOS
brew install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Or: choco install ffmpeg
```

### 2. Clone and Install

```bash
cd baitforge
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=your_newly_reset_token_here
APPLICATION_ID=1549619187398352997
OWNER_USER_ID=your_discord_user_id
ALLOWED_CHANNEL_ID=1549621880846164069
DATABASE_URL=sqlite:///./baitforge.db
STORAGE_PATH=./storage
MAX_UPLOAD_SIZE_MB=25
DEFAULT_LOUDNESS_DB=0
MAX_LOUDNESS_DB=18
LOG_LEVEL=info
NODE_ENV=production
```

### 4. Build

```bash
npm run build
```

Output goes to `dist/`.

### 5. Register Slash Commands

```bash
npm run register-commands
```

This registers `/front`, `/end`, `/loud`, `/bait` globally.

### 6. Start Bot

```bash
npm start
```

Expected output:
```
Initializing BaitForge bot...
Database initialized at ./baitforge.db
Loaded command: front
Loaded command: end
Loaded command: loud
Loaded command: bait
Bot is online (username: BaitForge, id: ...)
```

### 7. Test Connection

In Discord channel #audio (1549621880846164069):

```
/loud boost:6
```

Bot should reply:
```
🔊 Loudness updated
Your next /bait job will use +6 dB.
```

## Docker Deployment

### Build Image

```bash
docker build -t baitforge:latest .
```

### Run Container

```bash
docker run -d \
  --name baitforge \
  --env-file .env \
  -v ./storage:/app/storage \
  -v ./baitforge.db:/app/baitforge.db \
  -v ./logs:/app/logs \
  baitforge:latest
```

### Using docker-compose

```bash
docker-compose up -d
```

Check logs:
```bash
docker logs -f baitforge
```

Stop:
```bash
docker-compose down
```

## Railway Deployment

1. **Connect GitHub**
   - Sign in to railway.app
   - New Project → Import from GitHub
   - Select `herbleedingveins/baitforge`

2. **Set Environment Variables**
   - Variables → Add
   - `DISCORD_TOKEN` - paste newly reset token
   - `OWNER_USER_ID` - your Discord user ID
   - `NODE_ENV` - `production`
   - Others already in `.env.example`

3. **Deploy**
   - Railway auto-deploys on push
   - Check Logs for connection confirmation

4. **Custom Domain (Optional)**
   - Settings → Custom Domain
   - Add your domain

## Render Deployment

1. **Connect GitHub**
   - Sign in to render.com
   - New → Web Service
   - Connect repo

2. **Configure**
   - Name: `baitforge`
   - Environment: `Node`
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Environment**
   - Scroll to Environment
   - Add all vars from `.env.example`
   - **DISCORD_TOKEN** - paste newly reset token

4. **Deploy**
   - Click Create Web Service
   - Logs appear as it builds and starts

## Fly.io Deployment

1. **Install flyctl**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Authenticate**
   ```bash
   fly auth login
   ```

3. **Create App**
   ```bash
   fly launch
   ```
   - App name: `baitforge`
   - Region: closest to you
   - Postgres: no

4. **Set Secrets**
   ```bash
   fly secrets set DISCORD_TOKEN=your_token
   fly secrets set OWNER_USER_ID=your_id
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

## VPS Deployment (Ubuntu 22.04)

### 1. Server Setup

```bash
# Update
sudo apt update && sudo apt upgrade -y

# Install Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg git

# Verify
node --version
ffmpeg -version
```

### 2. Clone and Configure

```bash
cd /opt
sudo git clone https://github.com/herbleedingveins/baitforge.git
cd baitforge

cp .env.example .env
# Edit .env with your values
sudo nano .env

sudo npm install
sudo npm run build
npm run register-commands
```

### 3. Systemd Service

Create `/etc/systemd/system/baitforge.service`:

```ini
[Unit]
Description=BaitForge Discord Bot
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/baitforge
EnvironmentFile=/opt/baitforge/.env
ExecStart=/usr/bin/node /opt/baitforge/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 4. Start Service

```bash
sudo systemctl enable baitforge
sudo systemctl start baitforge
sudo systemctl status baitforge
```

### 5. Monitor Logs

```bash
sudo journalctl -u baitforge -f
```

### 6. Update Bot

```bash
cd /opt/baitforge
git pull
npm install
npm run build
npm run register-commands
sudo systemctl restart baitforge
```

## Monitoring

### Health Check

The bot logs on startup:
```
Bot is online (username: ..., id: ...)
```

If you see this, bot is connected.

### Logs

**Local:**
```bash
npm start  # Logs to console
```

**Production:**
```bash
NODE_ENV=production npm start  # JSON logs to stdout
```

**Docker:**
```bash
docker logs -f baitforge
```

**Systemd:**
```bash
journalctl -u baitforge -f
```

### Secrets Safety

- Never log TOKEN
- Never commit .env
- Always use gitignored .env
- Reset token if exposed
- Review bot logs for accidental secrets

## Troubleshooting

### "Missing DISCORD_TOKEN"

```bash
# Check .env exists
ls -la .env

# Check variable is set
echo $DISCORD_TOKEN

# For Docker, verify --env-file
docker run --env-file .env ...
```

### "Cannot find ffmpeg"

```bash
# Verify FFmpeg is installed
which ffmpeg
ffmpeg -version

# Install if missing
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg         # macOS
```

### "Database locked"

Close other bot instances:
```bash
ps aux | grep node
kill -9 <pid>
```

### "Bot doesn't respond"

1. Check bot is online: `systemctl status baitforge`
2. Check logs: `journalctl -u baitforge -f`
3. Verify channel ID correct in .env
4. Verify bot has permissions in channel

## What's Private

You must provide:
- `DISCORD_TOKEN` - newly reset
- `OWNER_USER_ID` - your Discord user ID
- Hosting (Railway, Docker, VPS, etc)
- Storage (local filesystem or cloud)

Public:
- All source code (except secrets)
- Database schema
- FFmpeg commands
- Documentation
- Deployment instructions
