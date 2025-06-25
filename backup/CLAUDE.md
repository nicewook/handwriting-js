# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js application that generates handwriting practice sheets as PDF files. The application uses custom fonts to create ruled practice sheets with sample text for handwriting practice.

## Core Architecture

The application is built around a single main script (`main.js`) that:

1. **Font Analysis**: Uses OpenType.js to analyze the custom font file and calculate appropriate font sizing based on x-height metrics
2. **PDF Generation**: Uses pdf-lib to create A4-sized practice sheets with precise typography guidelines
3. **Text Layout**: Implements intelligent text wrapping that respects line width constraints
4. **Grid System**: Creates ruled lines with different zones (ascender, x-height, baseline, descender) for proper letter formation

### Key Components

- **Font Management**: Dynamic font size calculation based on font metrics and desired x-height
- **Layout Engine**: Converts millimeter measurements to PDF points for precise positioning
- **Line Drawing**: Creates typography guidelines with different line styles (solid baseline, dashed helpers)
- **Text Wrapping**: Automatic word wrapping that measures text width to fit within margins

## Development Commands

```bash
# Install dependencies
npm install

# Generate practice sheet PDF
node main.js

# Start local HTTP server for development
npx http-server
```

## Key Configuration

The application uses several configuration constants in `main.js`:

- `FONT_PATH`: Path to the custom font file (currently RobotoMono-ExtraLightItalic.ttf)
- `OUTPUT_PATH`: Generated PDF filename
- `TOTAL_LINES`: Number of practice lines per page
- Layout margins and line spacing defined in millimeters, converted to PDF points

## Dependencies

- **pdf-lib**: Core PDF generation and manipulation
- **@pdf-lib/fontkit**: Font embedding support for custom fonts
- **opentype.js**: Font analysis and metrics extraction
- **http-server**: Development server for local testing

## File Structure

- `main.js`: Primary application logic
- `RobotoMono-ExtraLightItalic.ttf`: Custom font file
- `practice_sheet_roboto.pdf`: Generated output (created when script runs)
- `package.json`: Dependencies and project configuration

## Font Integration

The application requires custom font files in TTF format. The font analysis process:

1. Loads font using OpenType.js to extract metrics
2. Calculates appropriate font size based on x-height and desired zone height
3. Embeds font in PDF using pdf-lib fontkit integration

## Text Content

Practice text includes:
- Full alphabet (uppercase and lowercase) 
- Common pangrams and meaningful sentences
- Automatic text wrapping based on available line width