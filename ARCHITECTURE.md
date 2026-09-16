# Architecture

## Directory Structure

```
src/
├── index.ts              # Bot entry point, connection, event handlers
├── config.ts             # Environment variables and config validation
├── commands/             # Slash command definitions
│   ├── front.ts          # /front command (owner only)
│   ├── end.ts            # /end command (owner only)
│   ├── loud.ts           # /loud command (everyone)
│   ├── bait.ts           # /bait command (everyone)
│   └── register.ts       # Command registration script
├── interactions/         # Discord interaction handlers
│   ├── baitWizard.ts     # Multi-step bait selection flow
│   ├── selectMenus.ts    # Select menu handlers
│   ├── buttons.ts        # Button click handlers
│   └── baitProcessor.ts  # Main audio processing orchestration
├── audio/                # FFmpeg audio processing
│   ├── download.ts       # Download & validate attachments
│   ├── inspect.ts        # Audio metadata inspection (ffprobe)
│   ├── process.ts        # Audio concatenation & loudness (ffmpeg)
│   └── metadata.ts       # Metadata calculations
├── storage/              # Database and persistence
│   ├── database.ts       # SQLite connection & schema
│   ├── baitRepository.ts # Bait CRUD operations
│   └── loudnessRepository.ts # User loudness settings
├── security/             # Permission and authentication
│   └── permissions.ts    # Channel & owner guards
├── embeds/               # Discord embed builders
│   ├── audioEmbed.ts     # Result embed with metadata
│   └── errorEmbed.ts     # Error and warning embeds
└── utils/                # Utilities
    ├── logger.ts         # Pino logger with secret redaction
    ├── files.ts          # File utilities & formatters
    └── errors.ts         # Custom error classes
```

## Data Flow

### /front Command

```
User submits /front
  ↓
Validate channel (requireAllowedChannel)
  ↓
Validate owner (requireOwner)
  ↓
Download attachment (validateAudioAttachment)
  ↓
Inspect audio (ffprobe)
  ↓
Calculate checksum (sha256)
  ↓
Store file to disk (storage/front-baits/)
  ↓
Create database record (baitRepository.createBait)
  ↓
Send success embed
```

### /bait Command (Full Flow)

```
User submits /bait
  ↓
Validate channel
  ↓
Check front/end baits exist
  ↓
Start wizard (baitWizard.startBaitWizard)
  ↓
Step 1: User selects front bait (StringSelectMenu)
  ↓
Step 2: User uploads main audio (Modal with file attachment)
  ↓
Step 3: User selects end bait (StringSelectMenu)
  ↓
Step 4: Show summary (front + main + end + loudness)
  ↓
Step 5: User clicks "Process" button
  ↓
Defer interaction (baitProcessor.processBaitJob)
  ↓
Download all audio files (download.ts)
  ↓
FFmpeg concat: front + main + end (process.ts)
  ↓
Apply volume boost (0-18 dB)
  ↓
Apply limiter for peak protection
  ↓
Inspect result (ffprobe)
  ↓
Create result embed (createAudioEmbed)
  ↓
Send publicly with attachment
  ↓
Clear user loudness (loudnessRepository.clearUserLoudness)
  ↓
Clean temp files (download.cleanupTempDirectory)
```

## Database Schema

### baits
- Stores front/end bait clips
- Indexed by type and enabled status
- Unique constraint on (name, type)

### user_loudness
- Per-user loudness preferences (0-18 dB)
- Cleared after each bait job

### processing_jobs
- Job history for auditing
- Status tracking (pending → processing → completed/failed)
- Timing information for monitoring

## Security Layers

### 1. Token Management
- Read from `DISCORD_TOKEN` env only
- Never logged
- Never in source code

### 2. Channel Enforcement
- Every command checks `requireAllowedChannel()`
- Ephemeral error if wrong channel
- Channel ID from `ALLOWED_CHANNEL_ID` env

### 3. Permission Checks
- Owner commands: `requireOwner()` checks `OWNER_USER_ID`
- Uses authenticated `interaction.user.id` (never user-supplied)
- Non-owners get ephemeral error

### 4. Input Validation
- File type validation (audio formats only)
- File size limits (max 25 MB)
- File content inspection (ffprobe)
- Audio duration validation
- Name uniqueness checks

### 5. Logging Safety
- `sanitizeForLog()` redacts all secrets
- No tokens in error messages
- User IDs logged sparingly
- Structured JSON logging

### 6. File Management
- Temporary directory per job (unique ID)
- Files cleaned up after success/failure
- No file overwrite (unique names)
- Private storage directory

## FFmpeg Workflow

Input: front.mp3, main.mp3, end.mp3

```
ffmpeg \
  -i front.mp3 \
  -i main.mp3 \
  -i end.mp3 \
  -filter_complex \
    'concat=n=3:v=0:a=1[a]; [a]volume=6dB,alimiter=limit=1.0:release=100[a2]' \
  -map '[a2]' \
  -c:a libmp3lame \
  -b:a 192k \
  -ar 44100 \
  -ac 2 \
  output.mp3
```

- **concat**: Concatenate 3 audio streams
- **volume**: Apply loudness boost (0-18 dB)
- **alimiter**: Prevent clipping (limit=1.0 means -∞dB is the floor)
- **libmp3lame**: MP3 codec
- **192k**: Bitrate
- **44100**: Sample rate
- **ac 2**: Stereo

## Error Handling Strategy

### User Errors (Ephemeral Replies)
- Wrong channel
- Non-owner using /front or /end
- Invalid file format
- File too large
- Duplicate bait name

### System Errors (Public Embeds)
- FFmpeg crash
- Database error
- Disk space issue
- Network error

All errors:
- Logged with context
- User-friendly message
- No secrets in message
- No stack traces shown to user

## Concurrency & Job Isolation

- Each bait job gets unique `jobId` (timestamp-based)
- Temporary directory per job: `./temp/{jobId}/`
- Session map prevents cross-user button clicks
- Multiple concurrent jobs don't interfere
- Cleanup happens even if processing fails

## Deployment Architecture

### Local (Development)
- `npm run dev` watches TypeScript
- SQLite file at `./baitforge.db`
- Storage at `./storage/`
- Logs to console (colored)

### Docker
- Multi-stage build (dev → prod)
- FFmpeg installed in image
- Volume mounts for persistence
- Environment from .env file

### Cloud (Railway/Render/Fly)
- Build via GitHub
- Secrets in platform settings (never .env)
- Logs to stdout (captured by platform)
- Database can be SQLite or managed Postgres

## Performance Considerations

- **Database**: Indexes on type, enabled, user_id for fast queries
- **Audio Processing**: FFmpeg is single-threaded per job
- **Concurrency**: Node.js handles multiple concurrent interactions
- **Memory**: Streaming audio (not loaded entirely in RAM)
- **Disk**: Temporary files cleaned up after each job
- **Network**: 30-second timeout for Discord attachment downloads
