# Project Structure

## Root Directory
```
handwriting-js/
├── app/              # Next.js App Router directory
├── lib/              # Utility functions and configurations
├── assets/           # Server-side assets (fonts for PDF generation)
├── public/           # Static assets served by web server
├── docs/             # Documentation generation system
├── backup/           # Backup files
├── reference/        # Reference materials
└── Configuration files
```

## App Directory (`app/`)
```
app/
├── components/       # React UI components
│   ├── FontSelector.tsx      # Font selection component
│   ├── SizeSelector.tsx      # Size selection component
│   ├── TextSelector.tsx      # Text content selection
│   ├── PreviewSection.tsx    # Real-time preview
│   └── DownloadButton.tsx    # PDF generation trigger
├── actions/          # Next.js Server Actions
│   └── pdf-generator.ts      # PDF generation endpoints
├── fonts/            # Next.js font files (Geist)
├── layout.tsx        # Root layout component
├── page.tsx          # Home page component
└── globals.css       # Global CSS styles
```

## Library Directory (`lib/`)
```
lib/
├── hooks/            # Custom React hooks
│   └── useFontLoader.ts      # Font loading hook for preview
├── pdf-utils.ts      # Core PDF generation logic
├── fonts.ts          # Font metadata and configuration
├── constants.ts      # Application constants and configurations
└── font-utils.ts     # Font-related utility functions
```

## Assets Directory (`assets/`)
```
assets/
└── fonts/            # TTF font files for server-side PDF generation
    ├── RobotoMono-ExtraLightItalic.ttf
    ├── JetBrainsMono-ExtraLightItalic.ttf
    └── SourceCodePro-ExtraLightItalic.ttf
```

## Public Directory (`public/`)
```
public/
└── fonts/            # TTF font files for client-side web fonts
    ├── RobotoMono-ExtraLightItalic.ttf
    ├── JetBrainsMono-ExtraLightItalic.ttf
    └── SourceCodePro-ExtraLightItalic.ttf
```

## Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.mjs` - Next.js configuration
- `.eslintrc.json` - ESLint rules
- `CLAUDE.md` - AI assistant instructions

## Key Architectural Decisions

### Dual Font Storage
- **assets/fonts/**: Server-side PDF generation (included in Vercel bundle)
- **public/fonts/**: Client-side web fonts for preview

### Layer Separation
- **UI Layer**: React components handle user interaction
- **Server Actions**: Handle PDF generation and validation
- **PDF Engine**: Core PDF generation with typography system
- **Font Management**: Metadata and loading strategies

### Typography System
- **4-Zone Guidelines**: Ascender, x-height, baseline, descender
- **Dynamic Sizing**: OpenType metrics for accurate typography
- **Unicode Support**: Subset font embedding for international text