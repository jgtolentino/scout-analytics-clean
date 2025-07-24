# Publishing Guide for Pulser SDK

This guide explains how to publish the Pulser SDK to PyPI (Python) and npm (JavaScript/TypeScript).

## 📋 Prerequisites

### For PyPI
1. Create an account on [PyPI](https://pypi.org)
2. Create an account on [Test PyPI](https://test.pypi.org) (for testing)
3. Generate API tokens for both accounts
4. Install required tools:
   ```bash
   pip install build twine
   ```

### For npm
1. Create an account on [npmjs.com](https://www.npmjs.com)
2. Generate an access token (automation token recommended)
3. Configure npm authentication:
   ```bash
   npm login
   ```

## 🔑 Setting up Secrets

### GitHub Repository Secrets
Add these secrets to your GitHub repository:

1. **PYPI_API_TOKEN**: Your PyPI API token
2. **TEST_PYPI_API_TOKEN**: Your Test PyPI API token
3. **NPM_TOKEN**: Your npm automation token

Go to: Settings → Secrets and variables → Actions → New repository secret

## 📦 Manual Publishing

### Publishing to PyPI

```bash
cd python/

# Clean previous builds
rm -rf dist/ build/ *.egg-info

# Build the package
python -m build

# Check the package
twine check dist/*

# Upload to Test PyPI first
twine upload --repository testpypi dist/*

# Test installation
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ pulser-sdk

# If everything works, upload to PyPI
twine upload dist/*
```

### Publishing to npm

```bash
cd javascript/

# Clean and install
rm -rf node_modules dist
npm ci

# Run all checks
npm run lint
npm run typecheck
npm run test

# Build the package
npm run build

# Check what will be published
npm pack --dry-run
npm publish --dry-run

# Publish to npm
npm publish

# Add tags if needed
npm dist-tag add pulser-sdk@4.0.0 latest
npm dist-tag add pulser-sdk@4.0.0 stable
```

## 🤖 Automated Publishing

The repository includes GitHub Actions workflows that automatically publish packages when you create a release.

### Creating a Release

1. Go to your repository on GitHub
2. Click on "Releases" → "Create a new release"
3. Choose a tag (e.g., `v4.0.0`)
4. Set release title and description
5. Click "Publish release"

Both packages will be automatically built, tested, and published.

### Manual Workflow Trigger

You can also trigger publishing manually:

1. Go to Actions tab
2. Select "Publish Python Package to PyPI" or "Publish npm Package"
3. Click "Run workflow"
4. Enter the version number
5. Click "Run workflow"

## 📝 Version Management

### Updating Version Numbers

**Python** (`python/setup.py` and `python/pyproject.toml`):
```python
version="4.0.1"
```

**JavaScript** (`javascript/package.json`):
```json
"version": "4.0.1"
```

**Don't forget to update**:
- `python/src/pulser_sdk/__init__.py`
- `javascript/src/index.ts`
- README files

### Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (4.0.0 → 5.0.0): Breaking changes
- **MINOR** (4.0.0 → 4.1.0): New features, backwards compatible
- **PATCH** (4.0.0 → 4.0.1): Bug fixes

## 🧪 Pre-release Testing

### Test PyPI
```bash
# Install from Test PyPI
pip install --index-url https://test.pypi.org/simple/ pulser-sdk

# Verify
python -c "import pulser_sdk; print(pulser_sdk.__version__)"
```

### npm Beta Releases
```bash
# Publish beta version
npm version 4.0.1-beta.1
npm publish --tag beta

# Install beta
npm install pulser-sdk@beta
```

## 📊 Post-Publishing Checklist

- [ ] Verify package on [PyPI](https://pypi.org/project/pulser-sdk/)
- [ ] Verify package on [npm](https://www.npmjs.com/package/pulser-sdk)
- [ ] Test installation in a clean environment
- [ ] Update documentation with new version
- [ ] Create GitHub release if not already done
- [ ] Announce release (Twitter, Discord, etc.)
- [ ] Update dependent projects

## 🚨 Troubleshooting

### PyPI Issues

**"Invalid distribution file"**:
- Ensure `setup.py` and `pyproject.toml` are valid
- Check file naming conventions

**"Version already exists"**:
- Increment version number
- Delete old builds: `rm -rf dist/`

### npm Issues

**"402 Payment Required"**:
- Ensure package name isn't taken
- Check npm account permissions

**"ENEEDAUTH"**:
- Run `npm login` again
- Verify token in GitHub secrets

## 🔒 Security Best Practices

1. **Never commit tokens**: Use GitHub secrets
2. **Use automation tokens**: Not personal tokens
3. **Rotate tokens regularly**: Every 90 days
4. **Test on Test PyPI first**: Always
5. **Use 2FA**: On PyPI and npm accounts

## 📚 Additional Resources

- [PyPI Publishing Tutorial](https://packaging.python.org/tutorials/packaging-projects/)
- [npm Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

## 🆘 Getting Help

If you encounter issues:
1. Check the [FAQ](FAQ.md)
2. Open an issue on GitHub
3. Contact the maintainers

---

Remember: Always test thoroughly before publishing to production registries!