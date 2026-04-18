# GitHub Repository Configuration

This directory contains GitHub configuration files for the Market project.

## Contents

### Workflows (`.github/workflows/`)

Automated CI/CD pipelines for testing and deployment:

- **`build-and-test.yml`** - Build all services and create Docker images
- **`e2e-tests.yml`** - Run end-to-end integration tests with all services
- **`code-quality.yml`** - TypeScript compilation, linting, and dependency audits
- **`deploy.yml`** - Push Docker images to registry on main branch

### Documentation

- **`WORKFLOWS.md`** - Detailed documentation on all GitHub workflows
- **Pull Request Template** (`.github/pull_request_template.md`)
- **Issues Templates** - Bug reports and feature requests

## Quick Reference

### Workflows Execution Timeline

| Trigger | Workflows |
|---------|-----------|
| Pull Request | Build & Test, Code Quality, E2E Tests |
| Push to main | All workflows + Deploy |
| Daily 2 AM UTC | E2E Tests (nightly) |

### Service Communication in CI/CD

```
Auth Service (3000)
    ↓
Catalog Service (3001) ← Orders Service (3002)
    ↓
PostgreSQL instances (dedicated per service)
```

## Workflow Status

Check workflow status in the [Actions tab](../../actions) of this repository.

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Main README](../README.md) - Project overview
- [Workflows Documentation](./.github/WORKFLOWS.md) - Detailed workflow guide
