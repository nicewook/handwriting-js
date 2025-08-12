# Tech Stack

## Frontend Framework
- **Next.js 14.2.30** - React framework with App Router
- **React 18** - Component library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4.1** - Styling system

## PDF Generation
- **pdf-lib ^1.17.1** - PDF document creation and manipulation
- **@pdf-lib/fontkit ^1.1.1** - Custom font embedding support
- **opentype.js ^1.3.4** - Font analysis and metrics extraction

## Development Tools
- **ESLint 8** - Code linting with Next.js configuration
- **PostCSS 8** - CSS processing
- **TypeScript strict mode** - Enhanced type checking

## Documentation Tools (Custom)
- **Chokidar ^4.0.3** - File watching for docs generation
- **Gray-matter ^4.0.3** - Markdown frontmatter parsing
- **Marked ^16.0.0** - Markdown processing

## Runtime Environment
- **Node.js v22.17.1** (via nvm)
- **npm 10.9.2** - Package manager
- **Vercel** - Deployment platform (serverless functions)

## File System Structure
- **App Router** - Next.js 14 app directory structure
- **TypeScript paths** - `@/*` alias for root imports
- **Dual font storage** - assets/fonts/ (server) + public/fonts/ (web)