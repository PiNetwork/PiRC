# Security Policy

## Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub Issues.**

Email security@pivisualbuilder.org with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Considerations

### Plugin Security
- All plugins are sandboxed — cannot access other plugin state
- External network requests require explicit permission in manifest
- No direct DOM manipulation (use framework APIs only)
- Obfuscated code is rejected during review

### Data Security
- Privacy rules enforced at runtime — no bypass possible
- PiDCTP on-chain state is immutable — visual builder cannot alter it
- API keys stored encrypted, never exposed to client-side code

### AI Agent Security
- AI actions require user confirmation before execution
- AI cannot modify privacy rules without explicit approval
- AI-generated code is reviewed before deployment
- Rate limiting prevents AI abuse

## Scope

### In Scope
- Plugin system and sandboxing
- Data privacy rules enforcement
- AI Agent action boundaries
- API connector security
- PiDCTP integration correctness

### Out of Scope
- Pi Network core protocol (report to Pi team)
- Pi Browser vulnerabilities (report to Pi team)
- Third-party API security (report upstream)
