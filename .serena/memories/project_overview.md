# Project Overview

## Purpose
This is a **Next.js 14 application that generates handwriting practice sheets as PDF files**. Users can select different fonts, sizes, and practice texts to create personalized handwriting worksheets with professional typography guidelines.

## Key Features
- **PDF Generation**: Creates handwriting practice sheets with 4-zone typography system
- **Font Selection**: Multiple font options (Roboto Mono, JetBrains Mono, Source Code Pro)
- **Size Selection**: Small (14px), Medium (18px), Large (24px) with appropriate line spacing
- **Text Options**: Classic sentences and literary excerpts for practice
- **Real-time Preview**: Live preview of handwriting guidelines before PDF generation
- **Professional Typography**: Implements ascender line, x-height area, baseline, and descender line

## Target Users
- Korean speakers learning handwriting (UI in Korean)
- Students and educators needing handwriting practice materials
- Anyone wanting to create professional handwriting worksheets

## Current Status
- Fully functional PDF generation system
- Vercel deployment optimized (fonts moved from public/ to assets/ directory)
- Unicode text support with subset font embedding
- Resolved font loading issues in serverless environment