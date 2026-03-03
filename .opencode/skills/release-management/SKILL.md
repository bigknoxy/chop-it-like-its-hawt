---
name: release-management
description: Manage releases for chop-it-like-its-hawt using release-please workflow
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: github-actions
  project: chop-it-like-its-hawt
---

## Overview

This skill handles the complete release management workflow for the chop-it-like-its-hawt incremental game. The project uses release-please for automated versioning and GitHub releases.

## Prerequisites

### Required Permissions

Before starting any release, verify GitHub Actions permissions:

```bash
gh api repos/{owner}/{repo}/actions/permissions/workflow
```

Expected output:
```json
{
  "default_workflow_permissions": "write",
  "can_approve_pull_request_reviews": true
}
```

If permissions are incorrect, instruct the user to:
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

### Required Tools

- `gh` CLI (authenticated)
- `git` (configured with push access)
- Playwright (for verification)

## Release Workflow

### Step 1: Ensure Main is Up-to-Date

```bash
git fetch origin main
git checkout main
git pull origin main
```

### Step 2: Check Current State

```bash
# Check recent commits
git log --oneline -5

# Check recent workflow runs
gh run list --limit 5

# Check current version
cat package.json | grep version

# Check releases
gh release list --limit 5
```

### Step 3: Trigger Release (if needed)

The release-please workflow triggers automatically on push to main. If a feature was just merged:

1. Check if release-please created a release branch:
```bash
git branch -a | grep release-please
```

2. If release branch exists, create PR manually (if GitHub Actions cannot):
```bash
gh pr create --base main \
  --head "release-please--branches--main--components--chop-it-like-its-hawt" \
  --title "chore(main): release X.X.X" \
  --body ":robot: I have created a release *beep* *boop*"
```

### Step 4: Merge Release PR

```bash
# Check PR status
gh pr checks {pr-number}

# If checks pass and branch protection allows:
gh pr merge {pr-number} --squash --delete-branch

# If branch protection blocks merge:
gh pr merge {pr-number} --admin --squash --delete-branch
```

### Step 5: Handle Release Workflow Failure

If the `Release` workflow fails due to permissions, manually create the release:

```bash
gh release create vX.X.X \
  --target main \
  --title "vX.X.X - {Release Title}" \
  --notes "## Features
* feature description

## Bug Fixes
* fix description"
```

### Step 6: Verify Deployment

```bash
# Check Deploy workflow
gh run list --limit 3

# Verify deployed version
# Navigate to https://{owner}.github.io/{repo}/
# Open settings → About to check version
```

## Verification Checklist

After any release, verify with Playwright:

```javascript
// Navigate to deployed site
await page.goto('https://{owner}.github.io/{repo}/');

// Check version in About dialog
// Settings → About → Version should match release

// Verify no console errors
// Check browser console for errors

// Test basic gameplay
// - Click tree
// - Check wood count updates
// - Verify all UI sections render
```

## Release Notes Template

```markdown
## [X.X.X] - YYYY-MM-DD

### Features
* **area:** description of feature

### Bug Fixes
* description of fix

### Changes
| Item | Before | After |
|------|--------|-------|
| item | old | new |
```

## Troubleshooting

### Release Workflow Fails with "GitHub Actions is not permitted"

**Cause**: Workflow permissions not configured

**Solution**: 
1. Enable "Read and write permissions" in Actions settings
2. Enable "Allow GitHub Actions to create and approve pull requests"
3. Manually create release if already failed

### Deploy Workflow Fails

**Cause**: Build error or Vite configuration issue

**Solution**:
```bash
# Run build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Version Not Updating on Deployed Site

**Cause**: Browser cache or deployment not triggered

**Solution**:
```bash
# Check latest workflow run
gh run list --workflow=deploy.yml --limit 1

# Hard refresh in browser (Ctrl+Shift+R)
# Or clear site data
```

## File References

| File | Purpose |
|------|---------|
| `.github/workflows/release.yml` | release-please automation |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |
| `package.json` | Version number (updated by release-please) |
| `CHANGELOG.md` | Release history (generated) |
| `.release-please-manifest.json` | Version manifest |

## Common Commands

```bash
# View latest release
gh release view latest

# View workflow run logs
gh run view {run-id} --log-failed

# List open release PRs
gh pr list --head "release-please"

# Check current manifest version
cat .release-please-manifest.json
```

## Important Notes

1. **Always fetch main** before any release operations
2. **Verify CI is green** before merging release PRs
3. **Test deployed site** after each release
4. **Keep changelog updated** with meaningful descriptions
5. **Use semantic versioning**: MAJOR.MINOR.PATCH
   - MAJOR: Breaking changes
   - MINOR: New features
   - PATCH: Bug fixes
