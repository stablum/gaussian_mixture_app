# ML Explorer - Deployment Guide

## Online Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `ml-explorer` repository
   - Vercel will auto-detect Next.js and deploy

3. **Your app will be live at:** `https://explorer.mltutor.nl`

### Option 2: Netlify (Alternative - Free)

1. **Build for static export:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder to deploy
   - Or connect your GitHub repository

### Option 3: GitHub Pages (Free)

1. **Enable GitHub Pages in your repository settings**
2. **The app will be available at:** `https://username.github.io/ml-explorer`

## Quick Deploy Command

If you have Vercel CLI installed:
```bash
npx vercel --prod
```

## Environment Variables (if needed)
- `NODE_ENV=production`
- No additional environment variables required

## Features Included in Deployment
✅ Interactive ML algorithm visualization (GMM + K-means)
✅ Dual-mode algorithm switching
✅ EM Algorithm and K-means step-by-step execution
✅ CSV data upload functionality
✅ Real-time parameter visualization with draggable controls
✅ Convergence analysis for both algorithms
✅ Mathematical formulas panels
✅ Sample data generation
✅ Dark/light theme support
✅ Comprehensive error handling
✅ Mobile responsive design

## Post-Deployment Testing
1. Generate sample data
2. Run EM algorithm to convergence
3. Test navigation (Previous/Next buttons)
4. Upload CSV file
5. Verify log-likelihood display shows proper values