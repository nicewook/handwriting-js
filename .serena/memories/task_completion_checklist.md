# Task Completion Checklist

## Pre-Commit Validation

### Code Quality
- [ ] **Run ESLint**: `npm run lint` - Must pass without errors
- [ ] **TypeScript Check**: Ensure no type errors in IDE
- [ ] **Build Verification**: `npm run build` - Must complete successfully
- [ ] **Code Style**: Follow established conventions (see code_style_conventions.md)

### Functionality Testing
- [ ] **PDF Generation**: Test core functionality by generating a PDF
- [ ] **Font Loading**: Verify fonts load correctly in preview
- [ ] **UI Components**: Check all interactive components work
- [ ] **Responsive Design**: Test on different screen sizes

### File System Validation
- [ ] **Font Files**: Ensure TTF files exist in both assets/ and public/
- [ ] **Import Paths**: Verify all imports use correct paths (`@/` alias)
- [ ] **File Naming**: Follow naming conventions

## Deployment Readiness

### Vercel Environment
- [ ] **Font Loading**: Verify assets/fonts/ directory contains required TTF files
- [ ] **Serverless Compatibility**: Ensure no file system dependencies beyond bundle
- [ ] **Environment Variables**: Check if any environment-specific configurations needed

### Performance
- [ ] **Bundle Size**: Check for unnecessary dependencies
- [ ] **Font Optimization**: Ensure font subset embedding works correctly
- [ ] **PDF Generation Speed**: Verify reasonable generation time

## Documentation
- [ ] **Code Comments**: Add Korean comments for business logic
- [ ] **Function Documentation**: Update JSDoc comments if needed
- [ ] **CLAUDE.md**: Update project instructions if architecture changes

## Git Workflow
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "descriptive message"`
3. **Push**: `git push` (if ready for deployment)

## Emergency Checks
If PDF generation fails:
1. Check font file accessibility in assets/fonts/
2. Verify OpenType.js can parse the fonts
3. Check console logs for font loading errors
4. Test with different font selections

## Success Criteria
- ✅ ESLint passes
- ✅ TypeScript compiles without errors
- ✅ Production build succeeds
- ✅ PDF generation works with all fonts
- ✅ Preview functionality works correctly
- ✅ No console errors in browser