# Project Cleanup & Git Squash Instructions

## Cleanup Summary

The following cleanup has been completed:

✅ **Root `.gitignore`** - Enhanced with comprehensive ignore patterns
✅ **Root `package.json`** - Added repository metadata, scripts for Changesets
✅ **All package.json files** - Added repository, bugs, homepage, and publishConfig
✅ **README.md** - Updated to include Angular package
✅ **`.npmrc`** - Created for scoped package configuration

## Important: Update Repository URLs

Before committing, you need to replace `YOUR_USERNAME` in the following files with your actual GitHub username:

1. `/package.json` - `repository.url`
2. `/packages/ripple/package.json` - `repository.url`, `bugs.url`, `homepage`
3. `/packages/ripple-react/package.json` - `repository.url`, `bugs.url`, `homepage`
4. `/packages/ripple-angular/package.json` - `repository.url`, `bugs.url`, `homepage`

Search and replace: `YOUR_USERNAME` → `your-actual-github-username`

## Git Squash Instructions

### Option 1: Interactive Rebase (Recommended)

This will squash all commits into one initial commit:

```bash
# 1. Check current commit history
git log --oneline

# 2. Count how many commits you have (let's say N commits)
# 3. Start interactive rebase from the beginning
git rebase -i --root

# 4. In the editor that opens:
#    - Keep the first commit as "pick"
#    - Change all other commits from "pick" to "squash" (or "s")
#    - Save and close

# 5. In the commit message editor:
#    - Edit to create a single meaningful initial commit message
#    - Save and close

# 6. Verify the result
git log --oneline
```

### Option 2: Reset and Recommit (Simpler)

If you want a completely fresh start:

```bash
# 1. Remove git history (keep all files)
rm -rf .git

# 2. Initialize new git repository
git init

# 3. Add all files
git add .

# 4. Create initial commit
git commit -m "Initial commit: Ripple state management library

- Core state management package (@ripple/core)
- React bindings (@ripple/react)
- Angular bindings (@ripple/angular)
- Example applications for React and Angular
- Monorepo structure with npm workspaces"

# 5. Add remote (after creating GitHub repo)
git remote add origin https://github.com/YOUR_USERNAME/ripple.git

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

### Option 3: Soft Reset (Keep History but Clean)

If you want to keep some history but clean up:

```bash
# 1. Find the first commit hash
git log --reverse | head -1

# 2. Soft reset to before first commit (keeps all changes)
git update-ref -d HEAD

# 3. Stage all changes
git add .

# 4. Create new initial commit
git commit -m "Initial commit: Ripple state management library"

# 5. Force push (if already pushed)
# WARNING: Only do this if you're sure no one else is using the repo
git push -f origin main
```

## Recommended: Option 2 (Reset and Recommit)

For a clean initial commit, **Option 2** is recommended because:
- ✅ Simplest and cleanest
- ✅ No complex rebase operations
- ✅ Perfect for initial project setup
- ✅ Safe if you haven't pushed to GitHub yet

## After Squashing

1. **Create GitHub repository** (if not done already)
2. **Update repository URLs** in all package.json files
3. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ripple.git
   git branch -M main
   git push -u origin main
   ```

## Next Steps After Cleanup

1. ✅ Update repository URLs in package.json files
2. ✅ Squash commits using one of the methods above
3. ✅ Push to GitHub
4. ✅ Set up Changesets (we'll do this next)
5. ✅ Configure CI/CD for automated releases

## Files to Review Before Committing

Make sure these are properly configured:
- [ ] All `package.json` files have correct repository URLs
- [ ] `.gitignore` excludes build artifacts (`dist/`, `node_modules/`)
- [ ] No sensitive information in any files
- [ ] README files are up to date
- [ ] All package versions are set to `0.1.0` (ready for first publish)

