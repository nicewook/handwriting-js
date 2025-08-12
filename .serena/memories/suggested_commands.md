# Suggested Commands

## Development Commands

### Core Development
```bash
npm run dev        # Start development server at localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint linting
```

### Documentation Generation
```bash
npm run docs       # Generate documentation
npm run docs:watch # Generate docs with file watching
npm run docs:dark  # Generate docs with dark theme
npm run docs:github # Generate docs with GitHub theme
```

### Git Operations
```bash
git status         # Check repository status
git add .          # Stage all changes
git commit -m "message" # Commit with message
git push           # Push to remote repository
```

### Node.js Environment
```bash
node --version     # Check Node.js version (should be v22.17.1)
npm --version      # Check npm version (should be 10.9.2)
nvm use 22.17.1    # Switch to correct Node.js version if needed
```

### File Operations (macOS Darwin)
```bash
ls -la             # List files with details
find . -name "*.ts" # Find TypeScript files
grep -r "pattern" . # Search for pattern in files
open .             # Open current directory in Finder
```

## Deployment Commands

### Vercel Deployment
Note: Vercel CLI is not currently installed. Install with:
```bash
npm i -g vercel    # Install Vercel CLI globally
vercel --prod      # Deploy to Vercel production
```

## Development Workflow

### Starting Development
1. `npm run dev` - Start development server
2. Open http://localhost:3000
3. Make changes and see live reload

### Before Committing
1. `npm run lint` - Check for linting errors
2. `npm run build` - Ensure production build works
3. Test PDF generation functionality

### After Task Completion
1. **Always run linting**: `npm run lint`
2. **Verify build**: `npm run build`
3. **Test core functionality**: Generate a PDF to ensure system works
4. **Check TypeScript**: Ensure no type errors