# Claude Code Instructions for Gaussian Mixture Model Explorer

## 🔄 **MANDATORY CHECKLIST - Execute EVERY time a feature is completed:**

### 1. **Build & Test**
- [ ] Run `npm run build` to verify no compilation errors
- [ ] Run `npm run test` if tests exist
- [ ] Check TypeScript compilation is successful

### 2. **Version & Git Operations**
- [ ] **MANDATORY**: Bump version number in `app/page.tsx` (update the version string in the UI)
- [ ] Run `git status` to see all changes
- [ ] Run `git add .` to stage changes
- [ ] Commit with descriptive message including:
  - What was implemented/fixed
  - Why it was needed
  - Brief technical details
  - Always end with Claude Code signature block
- [ ] Run `git push origin main` to push to GitHub

### 3. **Deployment Verification**
- [ ] **CRITICAL**: After pushing, wait 2-3 minutes then check if Vercel deployment completed
- [ ] If user reports issues still exist, assume deployment didn't occur
- [ ] Create a version bump (update version number in UI) to force redeployment
- [ ] Push again to trigger fresh deployment

### 4. **User Communication**
- [ ] Clearly state what was implemented
- [ ] Mention that changes have been deployed
- [ ] If deployment might be delayed, inform user to wait 2-3 minutes

## 🎯 **Project-Specific Context**

### **Application Details**
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, D3.js, KaTeX
- **Purpose**: Educational tool for Gaussian Mixture Models and EM Algorithm
- **Deployment**: Vercel (auto-deploys from main branch)
- **User Focus**: Educational use, teaching sessions, mathematical accuracy

### **Current Features**
- Interactive GMM visualization with draggable parameters
- Dark mode support throughout
- Collapsible panels for focused teaching
- Editable parameters in ParameterPanel  
- Curve visibility toggles (mixture, components, posteriors, data points)
- Dual y-axis system for proper scaling
- Mathematical formulas with KaTeX (Bishop's notation)
- Mean (μ) dragging with dedicated handles
- CSV data upload and sample data generation

### **Common Issues to Watch For**
- **Deployment delays**: Vercel sometimes takes time to deploy
- **D3 coordinate systems**: Always use proper subject handling for drag behaviors
- **Dark mode**: Ensure all new components support theme switching
- **Mathematical notation**: Use Bishop's Pattern Recognition book notation
- **Panel spacing**: Collapsed panels should use minimal vertical space

### **Testing Commands**
- `npm run build` - Production build
- `npm run test` - Run all tests
- `npm run dev` - Development server
- `npm run lint` - Linting (if issues, run before deployment)

### **Key File Locations**
- Main page: `app/page.tsx`
- Chart component: `components/GMMChart.tsx`
- Parameter panel: `components/ParameterPanel.tsx`
- Theme context: `contexts/ThemeContext.tsx`
- Math formulas: `components/MathFormulasPanel.tsx`

## 🚨 **CRITICAL REMINDERS**
1. **ALWAYS run the full checklist above after completing ANY feature**
2. **ALWAYS verify deployment completed before marking tasks done**
3. **If user reports issue persists, assume deployment failed and force redeploy**
4. **Keep educational use case in mind - UI should support teaching**