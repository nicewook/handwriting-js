# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application that generates handwriting practice sheets as PDF files. Users can select different fonts, sizes, and practice texts to create personalized handwriting worksheets with professional typography guidelines.

## Development Commands

```bash
# Development
npm run dev        # Start development server at localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint

# Deployment
vercel --prod      # Deploy to Vercel production (auto-detects project)
```
## AI Collaboration (Claude Code + Gemini)
Claude Code can collaborate with Gemini to solve complex problems through bash commands. This enables a problem-solving dialogue between the two AI assistants.
### How to Collaborate
1. **Execute Gemini commands via bash**: Use the `gemini` command in bash to interact with Gemini
2. **Pass prompts as arguments**: Provide your question or request as arguments to the gemini command
3. **Iterative problem solving**: Use the responses from Gemini to refine your approach and continue the dialogue
### Example Usage
```bash
# Ask Gemini for help with a specific problem
gemini -p "How should I optimize this Flutter widget for better performance?"
# Request code review or suggestions
gemini -p "Review this GetX controller implementation and suggest improvements"
# Collaborate on debugging
gemini -p "This error occurs when running flutter build ios. What could be the cause?"
```
### Collaboration Workflow
1. **Identify complex problems**: When encountering challenging issues, consider leveraging Gemini's perspective
2. **Formulate clear questions**: Create specific, context-rich prompts for better responses
3. **Iterate on solutions**: Use responses to refine your approach and ask follow-up questions
4. **Combine insights**: Merge insights from both Claude Code and Gemini for comprehensive solutions

## Core Architecture

The application follows a layered architecture with a complex PDF generation pipeline:

### 1. UI Layer (`app/components/`)
- **FontSelector**: Manages font selection with preview capabilities
- **SizeSelector**: Handles font size selection (small/medium/large)
- **TextSelector**: Provides text options (classic sentences, literary excerpts)
- **PreviewSection**: Real-time preview of handwriting guidelines
- **DownloadButton**: Triggers PDF generation via Server Actions

### 2. Server Actions (`app/actions/pdf-generator.ts`)
- **generatePDF**: Main PDF generation endpoint with comprehensive error handling
- **validatePDFParams**: Input validation for fonts and sizes
- **checkPDFGenerationStatus**: System health check for font availability
- **getFontDebugInfo**: Development utility for font debugging

### 3. PDF Generation Engine (`lib/pdf-utils.ts`)
- **4-Zone Typography System**: Creates precise handwriting guidelines
  - Ascender line (top boundary for tall letters)
  - X-height area (main body of lowercase letters) with green rectangle border
  - X-height middle (dashed helper line)
  - Baseline (primary writing line)
  - Descender line (bottom boundary for descending letters)
- **Font Metrics Calculation**: Uses OpenType.js to extract font metrics and calculate appropriate sizing
- **Multi-Strategy Font Loading**: Extensive fallback system for Vercel environment compatibility

### 4. Font Management (`lib/fonts.ts`)
- **FontMetadata**: Comprehensive font information including file paths
- **Available Fonts**: Roboto Mono, JetBrains Mono, Source Code Pro (all ExtraLightItalic variants)
- **Size Mappings**: Small (14px), Medium (18px), Large (24px) with corresponding line spacing

### 5. Configuration (`lib/constants.ts`)
- **Page Layout**: A4 dimensions with precise margin calculations (mm to points conversion)
- **Guideline Styles**: Color coding and line weights for different guide types
- **Text Options**: Curated practice texts including literary excerpts
- **Font Size Mappings**: Relationship between UI sizes and PDF metrics

## Critical Technical Details

### Font Loading in Vercel Environment
The application implements a sophisticated multi-strategy font loading system to handle Vercel's serverless environment constraints:

```typescript
// Path strategies attempted in order:
1. process.cwd()/public/fonts/
2. LAMBDA_TASK_ROOT/public/fonts/ (Vercel serverless)
3. .next/standalone/public/fonts/
4. .vercel/output/static/fonts/
5. Various __dirname relative paths
6. Absolute /var/task/ paths
```

### PDF Generation Pipeline
1. **Font Validation**: Verifies TTF file accessibility and OpenType parsing
2. **Metrics Extraction**: Calculates x-height, units-per-em, and optimal font sizing
3. **Dynamic Sizing**: Adjusts font size to fit predefined line spacing zones
4. **Text Wrapping**: Intelligent word wrapping based on actual text width measurements
5. **Guideline Drawing**: Renders 4-zone system with precise positioning
6. **Font Embedding**: Embeds custom TTF fonts into PDF using pdf-lib + fontkit

### Known Issues & Debugging

**Vercel Production Font Loading**: The most common issue is font file accessibility in Vercel's serverless environment. The application includes extensive debugging:

- Environment variable logging (VERCEL, LAMBDA_TASK_ROOT, etc.)
- Directory structure exploration when fonts aren't found
- Multiple parsing strategies for OpenType.js compatibility
- Graceful fallback to basic PDF with system fonts

When troubleshooting font issues:
1. Check the PDF generation Server Action logs in Vercel function logs
2. Look for "🔍 [validateFontFile]" debug messages
3. Verify font files exist in `public/fonts/` directory
4. Consider the extensive path strategy logs to identify which approach succeeded

## File Structure Highlights

```
lib/
├── pdf-utils.ts          # Core PDF generation with Vercel compatibility
├── fonts.ts              # Font metadata and utility functions
├── constants.ts          # Layout, styling, and text configuration
└── hooks/
    └── useFontLoader.ts   # Client-side font loading for previews

app/
├── actions/
│   └── pdf-generator.ts   # Server Actions for PDF processing
├── components/           # React components for UI
└── page.tsx             # Main application page

public/
└── fonts/               # TTF font files (critical for PDF generation)
    ├── RobotoMono-ExtraLightItalic.ttf
    ├── JetBrainsMono-ExtraLightItalic.ttf
    └── SourceCodePro-ExtraLightItalic.ttf
```

## Dependencies

**Core PDF Generation**:
- `pdf-lib`: PDF document creation and manipulation
- `@pdf-lib/fontkit`: Custom font embedding support
- `opentype.js`: Font analysis and metrics extraction

**Framework**:
- `next`: 14.2.30 with App Router
- `react`: 18 with TypeScript
- `tailwindcss`: Styling system

## Typography System Details

The 4-zone system is designed for professional handwriting practice:
- **Zone heights**: Calculated dynamically based on font x-height metrics
- **Line spacing**: Configurable per size (4.5mm/5.5mm/6.5mm for small/medium/large)
- **Color coding**: Green for x-height area, gray for ascender/descender, light green dashed for x-height middle
- **Text positioning**: Sample text placed on baseline with proper margins

The system ensures consistent proportions regardless of font choice by using OpenType metrics to calculate optimal sizing.