# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BaitForge, please email security details directly rather than using the public issue tracker.

**Do not:**
- Post vulnerabilities publicly
- Include Discord tokens in any report
- Share bot secrets in issues or PRs

**Critical Issues:**
- Hardcoded secrets in code
- Token exposure in logs
- Unauthenticated command execution
- Database injection

## Security Practices

### Token Management

- Never hardcode `DISCORD_TOKEN`
- Always read from environment variables
- Reset token immediately if exposed
- Use `.env` file (gitignored) locally

### Logging

- All secrets redacted before logging
- No user data in production logs
- No tokens in error messages
- Use `sanitizeForLog()` utility

### Permissions

- Always use authenticated `interaction.user.id`
- Never trust user-supplied IDs
- Verify channel ID for every command
- Verify owner ID for admin commands

### Database

- Use parameterized queries (never string concat)
- Store file paths safely
- Validate all user input
- Clean up temporary files

### Audio Files

- Validate file type before processing
- Check file size limits
- Verify audio stream before combining
- Store in private directory
- Clean temporary files after job
