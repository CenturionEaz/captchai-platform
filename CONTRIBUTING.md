# 🤝 Contributing to CaptchaIQ Platform

First off, thank you for considering contributing! CaptchaIQ Platform thrives because of the research and engineering community. This document provides everything you need to make a high-quality contribution.

> **⚠️ Before contributing, please read [ETHICS.md](./ETHICS.md), [ACCEPTABLE_USE.md](./ACCEPTABLE_USE.md), and [DISCLAIMER.md](./DISCLAIMER.md). All contributions must align with the educational/research mission of this project.**

---

## 📚 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Types of Contributions](#types-of-contributions)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Standards](#commit-message-standards)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Release Process](#release-process)

---

## Code of Conduct

This project adheres to the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Report unacceptable behavior to the maintainers via GitHub's private reporting feature.

---

## Types of Contributions

We welcome contributions across multiple categories:

### 🐛 Bug Reports
- Search existing issues before opening a new one
- Use the Bug Report issue template
- Include steps to reproduce, expected vs actual behavior, and environment info

### ✨ Feature Requests
- Open a Discussion first for large features before a PR
- Use the Feature Request issue template
- Describe the use case and how it fits the project's research mission

### 📖 Documentation
- Fix typos, improve clarity, add examples
- Documentation PRs are always welcome
- Add architecture diagrams if they aid understanding

### 🔬 AI/ML Research
- New model integrations with benchmark comparisons
- Dataset contributions (must be ethically sourced)
- Algorithm improvements with performance metrics

### 🎨 UI/UX Improvements
- Accessibility improvements (WCAG compliance)
- Performance optimizations
- New dashboard components

### 🔐 Security Improvements
- Never open security bugs as public issues — see [SECURITY.md](./SECURITY.md)
- Hardening improvements are welcome as regular PRs

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/captchaiq-platform.git
cd captchaiq-platform

# Add the upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/captchaiq-platform.git
```

### 2. Create a Branch

```bash
# Always branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- pnpm 8+

### Quick Start

```bash
# Install all dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start development services
docker compose -f docker/docker-compose.dev.yml up -d

# Start the web app
pnpm dev
```

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for full setup instructions.

---

## Branching Strategy

We use **GitHub Flow**:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, always deployable |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation only |
| `chore/*` | Maintenance, dependency updates |
| `research/*` | Experimental AI research (may not merge to main) |

---

## Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Use Case |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding/fixing tests |
| `chore` | Build, CI, dependencies |
| `perf` | Performance improvement |
| `research` | Experimental/research work |

### Examples

```bash
feat(ai-engine): add YOLO-based image segmentation for slider CAPTCHAs
fix(dashboard): correct confidence score display for audio challenges
docs(setup): add Supabase RLS configuration guide
chore(deps): upgrade TailwindCSS to v4.0
```

---

## Pull Request Process

### Before Opening a PR

- [ ] Branch is up to date with `upstream/main`
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] New code has adequate test coverage (≥80%)
- [ ] Documentation updated if applicable
- [ ] CHANGELOG.md entry added for user-facing changes

### PR Title Format

Follow the same Conventional Commits format:
```
feat(dashboard): add real-time learning progress heatmap
```

### PR Description

Use the provided Pull Request template. Key sections:
- **What changed and why**
- **How to test**
- **Screenshots** (for UI changes)
- **Checklist**

### Review Process

1. Open PR → automated CI runs (lint, test, build)
2. Request review from at least 1 maintainer (2 for breaking changes)
3. Address all review comments
4. Maintainer approves and merges (squash merge preferred)

---

## Code Standards

### TypeScript / JavaScript
- **Formatter**: Prettier (config in `.prettierrc`)
- **Linter**: ESLint (config in `.eslintrc`)
- **Style**: Functional components, custom hooks, named exports
- Run: `pnpm lint:fix && pnpm format`

### Python
- **Formatter**: Black
- **Linter**: Ruff
- **Type hints**: Required for all public functions
- Run: `ruff check --fix . && black .`

### General
- No commented-out code in PRs
- No `console.log` in production code (use the logger utility)
- All magic numbers must be named constants
- Functions should have a single responsibility

---

## Testing Requirements

### Frontend (Next.js)
- Unit tests: Vitest + React Testing Library
- E2E tests: Playwright
- Coverage target: 80%

```bash
pnpm test              # Run all tests
pnpm test:e2e          # Run Playwright tests
pnpm test:coverage     # Generate coverage report
```

### Backend (FastAPI / Python)
- Unit tests: pytest
- Coverage target: 80%

```bash
cd apps/api && pytest --cov=app tests/
```

### AI/ML Services
- Include benchmark results in PR description
- Compare against baseline metrics documented in `docs/BENCHMARKS.md`

---

## Documentation

- All public APIs must have JSDoc/docstring documentation
- New features require a corresponding entry in `docs/`
- Architecture changes require updated diagrams
- Update the relevant section of `README.md` if user-facing behavior changes

---

## Release Process

Releases are managed by maintainers:

1. Version bump following [SemVer](https://semver.org/)
2. CHANGELOG.md updated
3. GitHub Release created with auto-generated notes
4. Docker images tagged and pushed
5. Vercel deployment auto-triggered

---

## 🙏 Recognition

All contributors are recognized in:
- The GitHub Contributors page
- Our CHANGELOG.md
- The project's About section

Thank you for making CaptchaIQ Platform better! 🚀
