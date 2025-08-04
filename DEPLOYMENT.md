# Automated Deployment Setup

## 🚀 Current Setup

Your ML Explorer has **automated deployment** configured:

- **Production URL**: https://explorer.mltutor.nl/
- **Auto-deploy on**: Every push to `main` branch
- **Tests run automatically**: Before each deployment
- **Preview deployments**: Created for pull requests

## 🔄 How It Works

### Vercel Integration (Primary)
1. **Push to GitHub** → Vercel automatically detects changes
2. **Builds your app** → Runs `npm run build`
3. **Deploys to production** → Updates live site
4. **Takes ~2-3 minutes** from push to live

### GitHub Actions (Backup/Testing)
- Runs comprehensive tests on every push
- Creates preview deployments for pull requests
- Validates build before deployment

## ⚡ Quick Deploy Workflow

```bash
# Make your changes
git add .
git commit -m "✨ Add new feature"
git push origin main

# ✅ Your changes are automatically:
# 1. Tested
# 2. Built  
# 3. Deployed to https://explorer.mltutor.nl/
```

## 🛠 Setup Details

### Vercel Configuration
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x

### Environment Variables (if needed)
```bash
NODE_ENV=production
```

## 📊 Deployment Status

You can check deployment status at:
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/stablum/ml-explorer/actions

## 🔧 Manual Deployment (if needed)

If you ever need to manually deploy:

```bash
# Using Vercel CLI
npx vercel --prod

# Or force rebuild on Vercel dashboard
```

## 🚨 Rollback

If something goes wrong:
1. Go to Vercel dashboard
2. Find the previous working deployment
3. Click "Promote to Production"

## ✅ Benefits of This Setup

- 🔄 **Zero manual work** - Just push and deploy
- 🧪 **Automatic testing** - Catches bugs before deployment  
- ⚡ **Fast deployments** - Live in 2-3 minutes
- 🔙 **Easy rollbacks** - One-click revert if needed
- 📱 **Preview deployments** - Test PRs before merging