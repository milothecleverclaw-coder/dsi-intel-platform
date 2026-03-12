# DSI Platform - Agent Instructions

> Version 1.0.0

## Versioning Workflow

This project uses semantic versioning (semver) for tracking releases. Version information is stored in:
- `VERSION` file in the project root
- `package.json` `version` field
- `NEXT_PUBLIC_APP_VERSION` environment variable (injected at build time)

- Git tags (e.g., `v0.1.0`, `v0.1.1`)

### When to Bump Version
Before making significant changes to run one of the version scripts:

1. `npm run version:patch` - For bug fixes (0.1.0 → 0.1.1)
2. `npm run version:minor` - For new features (0.1.0 → 0.2.0)
3. `npm run version:major` - For breaking changes (0.1.0 → 1.0.0)

Each script will:
- Update the `VERSION` file
- Update `package.json` version field
- Create a git tag with the new version

- Commit the changes

- Build and deploy

### Example
```bash
# After making changes, bump patch version
npm run version:patch
git add .
git commit -m "chore: bump version to 0.1.1"
npm run build
```
