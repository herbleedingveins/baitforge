# Testing Checklist

## Pre-Deployment

### Environment
- [ ] `.env` is NOT committed (check .gitignore)
- [ ] `.env.example` shows safe template
- [ ] `DISCORD_TOKEN` is newly reset (verify in Discord dev panel)
- [ ] All required vars set: TOKEN, APP_ID, OWNER_ID, CHANNEL_ID

### Database
- [ ] SQLite tables created on startup
- [ ] Can insert/query baits
- [ ] Can insert/query user loudness
- [ ] Can cleanup on graceful shutdown

### Bot Connection
- [ ] Bot connects to Discord
- [ ] Bot appears online in server
- [ ] Slash commands registered and visible
- [ ] No errors in logs on startup

## Permission Tests

### Channel Restriction
- [ ] `/front` rejected in wrong channel (ephemeral)
- [ ] `/end` rejected in wrong channel (ephemeral)
- [ ] `/loud` rejected in wrong channel (ephemeral)
- [ ] `/bait` rejected in wrong channel (ephemeral)
- [ ] All commands work in correct channel

### Owner Restrictions
- [ ] Owner can use `/front`
- [ ] Non-owner cannot use `/front` (ephemeral error)
- [ ] Owner can use `/end`
- [ ] Non-owner cannot use `/end` (ephemeral error)
- [ ] Everyone can use `/loud` (in correct channel)
- [ ] Everyone can use `/bait` (in correct channel)

## Loudness Tests

- [ ] `/loud boost:0` sets to 0 dB
- [ ] `/loud boost:6` sets to 6 dB
- [ ] `/loud boost:18` sets to 18 dB
- [ ] `/loud boost:19` rejected (max 18)
- [ ] `/loud boost:-1` rejected (min 0)
- [ ] User message confirms setting
- [ ] Setting persists across commands
- [ ] Setting clears after bait job

## Bait Management Tests

### Front Bait
- [ ] Owner can add front bait with `/front name:test audio:file.mp3`
- [ ] Success embed shows duration and file size
- [ ] Duplicate name rejected
- [ ] File stored in storage/front-baits/
- [ ] Metadata in database (duration, peak, etc)
- [ ] Empty file rejected
- [ ] Oversized file (>25MB) rejected
- [ ] Non-audio file rejected

### End Bait
- [ ] Owner can add end bait with `/end name:outro audio:file.mp3`
- [ ] Success embed shows duration and file size
- [ ] Duplicate name rejected
- [ ] File stored in storage/end-baits/
- [ ] Metadata in database
- [ ] Same validation as front bait

## Bait Processing Tests

### Wizard Flow
- [ ] `/bait` shows error if no front baits exist
- [ ] `/bait` shows error if no end baits exist
- [ ] Step 1: Can select front bait from list
- [ ] Step 2: Can upload main audio
- [ ] Step 3: Can select end bait from list
- [ ] Step 4: Summary shows all selections + loudness
- [ ] Step 5: Process button defers reply
- [ ] Only interaction creator can click buttons

### Audio Processing
- [ ] FFmpeg combines front + main + end in order
- [ ] Loudness boost applied (0-18 dB)
- [ ] Limiter prevents clipping
- [ ] Output is valid MP3
- [ ] Duration calculated correctly
- [ ] Peak measurement accurate
- [ ] File size recorded

### Result Posting
- [ ] Result sent publicly (not ephemeral)
- [ ] Embed has title "BaitForge Audio Complete"
- [ ] All metadata fields populated:
  - Original filename
  - Duration (MM:SS)
  - Loudness boost
  - Highest peak (dBFS)
  - File size (MB)
  - Front bait name
  - End bait name
  - Output format (MP3)
- [ ] Footer says "Made by slurz · BaitForge"
- [ ] Audio attachment directly with embed
- [ ] Can download and play result

## Error Handling

- [ ] Corrupt audio file rejected with message
- [ ] Network timeout during download handled
- [ ] FFmpeg crash doesn't crash bot
- [ ] Database error logged and replied to user
- [ ] Interaction timeout gracefully handled
- [ ] Multiple concurrent jobs don't interfere
- [ ] User clicking another user's button rejected
- [ ] Missing attachment on /front rejected
- [ ] Missing attachment on /end rejected

## Logging & Secrets

- [ ] Bot logs startup without token
- [ ] Bot logs commands without user IDs (only count/type)
- [ ] Bot logs errors without credentials
- [ ] Token never appears in logs or console
- [ ] Errors are user-friendly in Discord
- [ ] Debug logs only in development

## Cleanup

- [ ] Temporary files deleted after processing
- [ ] Failed jobs don't leave temp files
- [ ] Database connections close gracefully on SIGINT
- [ ] Ctrl+C stops bot cleanly
- [ ] No zombie processes

## Deployment

- [ ] Bot starts with `npm start`
- [ ] Bot starts with `npm run dev` (watch mode)
- [ ] Docker build succeeds
- [ ] Docker container runs bot
- [ ] Environment variables from .env used
- [ ] Bot reconnects on network loss
- [ ] Bot handles graceful shutdown
