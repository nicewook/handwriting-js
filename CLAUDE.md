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
**RESOLVED**: Following Gemini's recommendation, font files have been moved from `public/fonts/` to `assets/fonts/` directory to ensure they are included in Vercel's serverless function bundle:

```typescript
// Current simplified approach:
const resolvedPath = join(process.cwd(), fontPath); // e.g., "assets/fonts/RobotoMono-ExtraLightItalic.ttf"
const fontBuffer = await readFile(resolvedPath);
```

**Key Changes**:
- Font files relocated to `assets/fonts/` (included in serverless bundle)
- Removed complex multi-strategy path resolution (327 lines → simple single path)
- Maintained `public/fonts/` copies for web font CSS (client-side preview)
- Added `webFilePath` property to FontMetadata for client/server path separation

### PDF Generation Pipeline
1. **Font Validation**: Verifies TTF file accessibility and OpenType parsing
2. **Metrics Extraction**: Calculates x-height, units-per-em, and optimal font sizing
3. **Dynamic Sizing**: Adjusts font size to fit predefined line spacing zones
4. **Text Wrapping**: Intelligent word wrapping based on actual text width measurements
5. **Guideline Drawing**: Renders 4-zone system with precise positioning
6. **Font Embedding**: Embeds custom TTF fonts with Unicode subset support:
   ```typescript
   const customFont = await doc.embedFont(fontBytes, {
     subset: true,  // Unicode subset activation for Korean text support
   });
   ```
7. **Text Rendering**: Includes fallback handling for encoding issues

### Known Issues & Debugging

**RESOLVED - Font Loading**: Previously complex Vercel serverless font loading issues have been resolved by moving fonts to `assets/fonts/` directory.

**RESOLVED - Unicode Encoding**: WinAnsi encoding errors with Korean text have been resolved by:
- Adding `subset: true` option to font embedding for Unicode support
- Implementing fallback text rendering for encoding failures
- Removing Korean text from fallback PDF messages

**Current Debugging Approach**:
- Simple path resolution logging: `join(process.cwd(), fontPath)`
- Font file validation with basic error handling
- Text rendering with graceful fallback to English text

**Troubleshooting Steps**:
1. Verify font files exist in `assets/fonts/` directory
2. Check console logs for "🔍 [loadFontMetrics]" messages
3. Ensure fonts support required character sets (especially for non-English text)

## File Structure Highlights

```
lib/
├── pdf-utils.ts          # Core PDF generation (simplified font loading)
├── fonts.ts              # Font metadata with webFilePath/filePath separation
├── constants.ts          # Layout, styling, and text configuration
└── hooks/
    └── useFontLoader.ts   # Client-side font loading for previews

app/
├── actions/
│   └── pdf-generator.ts   # Server Actions for PDF processing
├── components/           # React components for UI
└── page.tsx             # Main application page

assets/
└── fonts/               # TTF font files (serverless bundle included)
    ├── RobotoMono-ExtraLightItalic.ttf
    ├── JetBrainsMono-ExtraLightItalic.ttf
    └── SourceCodePro-ExtraLightItalic.ttf

public/
└── fonts/               # TTF font files (web font CSS only)
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

## AI Interaction Guidelines

### Translation and Execution Strategy
- When receiving requests in Korean, first rephrase the prompt into natural English expression
- Translate the prompt while preserving the original intent and context
- Execute the command using the translated, grammatically correct English version