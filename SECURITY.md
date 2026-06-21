# 🔒 Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x.x   | ✅ Yes    |

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include as much information as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## ⏱️ Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity

## 🛡️ Security Best Practices

When using this starter kit:

1. **Secrets and Variables**
   - Never commit `.dev.vars`, `.env`, or real credentials
   - Use `.dev.vars.example` only as the committed local template
   - Use `wrangler secret put <NAME>` or Cloudflare dashboard secrets for deployed sensitive data
   - Do not put sensitive values in plaintext `vars` inside `wrangler.jsonc`
   - Rotate credentials regularly

2. **Dependencies**
   - Keep dependencies updated with `bun update --latest` when intentionally upgrading
   - Run `bun audit` or `bun run check` regularly
   - Bun installs use `minimumReleaseAge = 259200` to avoid very fresh npm releases
   - Bun installs use `@socketsecurity/bun-security-scanner`; set `SOCKET_API_KEY` for Socket.dev organization settings
   - Review security advisories

3. **Cloudflare Worker Configuration**
   - Keep `wrangler.jsonc` as the source of truth for bindings
   - Run `bun run cf-typegen` after binding or compatibility-date changes
   - Treat `worker-configuration.d.ts` as generated output

4. **API Security**
   - Validate all inputs using Elysia schemas
   - Implement rate limiting for production
   - Use HTTPS in production
   - Avoid exposing internal error details in public responses

## 📜 Disclosure Policy

- We will acknowledge receipt of your report
- We will work with you to understand and resolve the issue
- We will credit you in the fix announcement (unless you prefer anonymity)

Thank you for helping keep Workerlysia secure! 💜
