# 🔐 Security Policy

## Supported Versions

| Version | Security Support |
|---------|-----------------|
| 1.x (latest) | ✅ Full support |
| < 1.0 (pre-release) | ⚠️ Best effort only |

---

## Reporting a Vulnerability

**DO NOT open a public GitHub issue for security vulnerabilities.**

### Preferred Method: GitHub Security Advisories

1. Go to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Fill out the advisory form with full details
4. We will acknowledge receipt within **48 hours**
5. We aim to provide an initial assessment within **7 days**
6. We follow a **90-day coordinated disclosure** timeline

### What to Include

Please provide:
- Affected component(s) and version
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested mitigation (if known)
- Your name/handle for credit (optional)

---

## Vulnerability Severity Classification

| Severity | Description | Response SLA |
|----------|-------------|--------------|
| 🔴 Critical | Remote code execution, authentication bypass | 24 hours |
| 🟠 High | Privilege escalation, significant data exposure | 72 hours |
| 🟡 Medium | Limited data exposure, service degradation | 7 days |
| 🟢 Low | Minor issues, hardening improvements | 30 days |

---

## Scope

### In Scope
- Authentication and authorization flaws
- API security vulnerabilities
- SQL injection / NoSQL injection
- XSS, CSRF, SSRF
- Dependency vulnerabilities with known exploits
- Insecure data storage or transmission
- Docker/container security issues
- Secrets or credentials exposed in code

### Out of Scope
- Issues in third-party dependencies without demonstrated exploitability
- Rate limiting issues that don't constitute an attack vector
- Self-XSS (requires victim to attack themselves)
- Social engineering attacks
- Physical security
- Issues only reproducible on unsupported versions

---

## Security Best Practices for Deployment

### Environment Variables
- **Never** commit `.env` files to source control
- Use your deployment platform's secret management (Vercel env vars, Kubernetes Secrets)
- Rotate API keys immediately if accidentally exposed

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use principle of least privilege for database roles
- Enable SSL/TLS for all database connections
- Regularly audit database access logs

### API Security
- All API endpoints require authentication (except public health checks)
- Implement rate limiting on all endpoints
- Use HTTPS exclusively — never HTTP in production
- Validate and sanitize all inputs
- Use prepared statements for all database queries

### Authentication
- Use short-lived JWT tokens (recommended: 15 minutes)
- Implement refresh token rotation
- Enable MFA for all admin accounts
- Log all authentication events

### Container Security
- Run containers as non-root users
- Use read-only container filesystems where possible
- Scan Docker images with `docker scout` or Trivy
- Pin all dependency versions in production

---

## Responsible Disclosure Policy

We follow coordinated vulnerability disclosure:

1. **Report** → Researcher reports vulnerability privately
2. **Acknowledge** → We acknowledge within 48 hours
3. **Investigate** → We assess and reproduce the issue
4. **Patch** → We develop and test a fix
5. **Credit** → We prepare a security advisory with researcher credit
6. **Release** → Patch is released; advisory is published
7. **Disclosure** → Full public disclosure after patch is available

We request researchers:
- Allow 90 days before public disclosure (extendable by agreement)
- Not disclose the vulnerability during the embargo period
- Not exploit the vulnerability beyond what is necessary to demonstrate it
- Not access, modify, or delete data belonging to others

---

## Hall of Fame

We maintain a Security Hall of Fame in our documentation for researchers who responsibly disclose significant vulnerabilities. Contact us to be included.

---

## Legal Safe Harbor

We will not pursue legal action against researchers who:
- Follow this responsible disclosure policy
- Do not access, modify, or delete data belonging to others
- Do not disrupt service availability
- Do not violate user privacy
- Act in good faith

---

*Security Policy Version 1.0 | Copyright (c) 2026 Pratyush*
