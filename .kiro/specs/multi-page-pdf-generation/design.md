# Design Document

## Overview

The multi-page PDF generation feature extends the existing single-page handwriting practice sheet generator to support distributing text content across multiple pages (up to 50 pages). The design maintains the current 4-zone guideline system and text formatting while adding intelligent text distribution, page management, and user controls for page limits.

The solution builds upon the existing PDF generation pipeline using pdf-lib and maintains compatibility with the current Roboto Mono font system and text selection options.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Controls   │───▶│  PDF Generator   │───▶│   Multi-Page    │
│                 │    │                  │    │   PDF Output    │
│ - Page Limit    │    │ - Text Splitter  │    │                 │
│ - Text Options  │    │ - Page Manager   │    │ - Page Numbers  │
│ - Size Options  │    │ - Layout Engine  │    │ - Consistent    │
│                 │    │                  │    │   Guidelines    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture

The design introduces new components while extending existing ones:

1. **Enhanced UI Components**
   - `PageLimitSelector`: New component for page limit control
   - `PageCountPreview`: New component showing estimated page count
   - Enhanced `DownloadButton`: Updated to handle multi-page generation
   - Enhanced `PreviewSection`: Updated to show page count estimates

2. **Enhanced PDF Generation Pipeline**
   - `MultiPagePDFGenerator`: New core class for multi-page generation
   - `TextDistributor`: New class for intelligent text distribution
   - `PageManager`: New class for page layout and numbering
   - Enhanced `pdf-utils.ts`: Extended with multi-page functions

3. **Enhanced Server Actions**
   - Enhanced `generatePDF`: Updated to support page limits
   - New `estimatePageCount`: Server action for page count estimation

## Components and Interfaces

### New UI Components

#### PageLimitSelector Component
```typescript
interface PageLimitSelectorProps {
  selectedLimit: number;
  onLimitChange: (limit: number) => void;
  maxLimit?: number; // Default: 50
  disabled?: boolean;
}
```

#### PageCountPreview Component
```typescript
interface PageCountPreviewProps {
  selectedTextId: TextOptionId;
  selectedSize: number;
  pageLimit: number;
  onEstimateUpdate?: (estimate: PageEstimate) => void;
}

interface PageEstimate {
  estimatedPages: number;
  exceedsLimit: boolean;
  totalCharacters: number;
  averageCharsPerPage: number;
}
```

### Enhanced PDF Generation Interfaces

#### MultiPagePDFOptions
```typescript
interface MultiPagePDFOptions extends PDFGenerationOptions {
  pageLimit: number;
  includePageNumbers: boolean;
  pageNumberFormat: 'simple' | 'detailed'; // "X" vs "Page X of Y"
}
```

#### TextDistributionResult
```typescript
interface TextDistributionResult {
  pages: PageContent[];
  totalPages: number;
  truncatedContent: boolean;
  distributionStats: {
    totalCharacters: number;
    averageCharsPerPage: number;
    linesPerPage: number;
  };
}

interface PageContent {
  pageNumber: number;
  textLines: string[];
  lineCount: number;
  characterCount: number;
}
```

### Enhanced Server Action Interfaces

#### Enhanced PDFGenerationResult
```typescript
interface PDFGenerationResult {
  success: boolean;
  data?: string;
  error?: string;
  filename?: string;
  contentType?: string;
  // New multi-page fields
  pageCount?: number;
  truncatedContent?: boolean;
  generationStats?: {
    totalPages: number;
    totalCharacters: number;
    averageCharsPerPage: number;
    generationTimeMs: number;
  };
}
```

## Data Models

### Page Limit Configuration
```typescript
interface PageLimitConfig {
  min: number; // 1
  max: number; // 50
  default: number; // 10
  step: number; // 1
}

const PAGE_LIMIT_CONFIG: PageLimitConfig = {
  min: 1,
  max: 50,
  default: 10,
  step: 1
};
```

### Text Distribution Settings
```typescript
interface TextDistributionSettings {
  preserveSentences: boolean; // true
  preserveParagraphs: boolean; // true
  minLinesPerPage: number; // 5
  maxLinesPerPage: number; // Based on font size
  sentenceBreakPenalty: number; // Cost of breaking sentences
  paragraphBreakPenalty: number; // Cost of breaking paragraphs
}
```

### Page Layout Configuration
```typescript
interface MultiPageLayoutConfig {
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-center';
  pageNumberMargin: number; // Distance from page edge
  pageNumberFontSize: number; // Font size for page numbers
  firstPageNumbered: boolean; // Whether to number the first page
}
```

## Error Handling

### Error Types
```typescript
enum MultiPagePDFError {
  CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE',
  PAGE_LIMIT_EXCEEDED = 'PAGE_LIMIT_EXCEEDED',
  TEXT_DISTRIBUTION_FAILED = 'TEXT_DISTRIBUTION_FAILED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT'
}
```

### Error Handling Strategy
1. **Graceful Degradation**: If multi-page generation fails, fall back to single-page generation
2. **Progressive Loading**: For large documents, show progress indicators
3. **Memory Management**: Monitor memory usage and provide warnings for large documents
4. **Timeout Handling**: Set reasonable timeouts for PDF generation (30 seconds)
5. **User Feedback**: Provide clear error messages and suggested actions

### Fallback Mechanisms
- If text distribution fails, use simple character-based splitting
- If page numbering fails, generate PDF without page numbers
- If memory limits are exceeded, reduce page limit automatically
- If generation times out, offer to generate with fewer pages

## Testing Strategy

### Unit Tests
1. **Text Distribution Logic**
   - Test sentence preservation across page boundaries
   - Test paragraph preservation
   - Test character limits and truncation
   - Test edge cases (empty text, single sentence, etc.)

2. **Page Management**
   - Test page numbering accuracy
   - Test page limit enforcement
   - Test layout consistency across pages

3. **PDF Generation**
   - Test multi-page PDF structure
   - Test font embedding across pages
   - Test guideline consistency

### Integration Tests
1. **End-to-End PDF Generation**
   - Test complete multi-page generation workflow
   - Test various text lengths and page limits
   - Test different font sizes and their impact on page count

2. **UI Integration**
   - Test page limit selector functionality
   - Test page count estimation accuracy
   - Test download button behavior with multi-page PDFs

### Performance Tests
1. **Generation Speed**
   - Test generation time for various page counts (1, 10, 25, 50 pages)
   - Test memory usage during generation
   - Test browser responsiveness during generation

2. **File Size Optimization**
   - Test PDF file sizes for different page counts
   - Test font subsetting effectiveness
   - Test compression efficiency

### User Experience Tests
1. **Page Count Estimation**
   - Test accuracy of page count estimates (±1 page tolerance)
   - Test real-time updates when settings change
   - Test warning displays for exceeded limits

2. **Progress Feedback**
   - Test progress indicators during generation
   - Test error message clarity and helpfulness
   - Test download success feedback

## Implementation Phases

### Phase 1: Core Multi-Page Infrastructure
- Implement `MultiPagePDFGenerator` class
- Implement `TextDistributor` for intelligent text splitting
- Implement `PageManager` for page layout and numbering
- Add multi-page support to existing `generateHandwritingPDF` function

### Phase 2: UI Enhancements
- Create `PageLimitSelector` component
- Create `PageCountPreview` component
- Enhance `DownloadButton` with multi-page support
- Update `PreviewSection` with page count estimates

### Phase 3: Server Action Enhancements
- Enhance `generatePDF` server action with page limit support
- Implement `estimatePageCount` server action
- Add comprehensive error handling and fallback mechanisms
- Implement progress tracking for long-running generations

### Phase 4: Optimization and Polish
- Implement memory optimization for large documents
- Add performance monitoring and optimization
- Implement comprehensive testing suite
- Add user experience enhancements (progress bars, better error messages)

## Technical Considerations

### Memory Management
- Use streaming PDF generation for large documents
- Implement garbage collection hints for large text processing
- Monitor memory usage and provide warnings
- Implement automatic page limit reduction if memory constraints are detected

### Performance Optimization
- Cache font metrics calculations
- Optimize text measurement operations
- Use efficient string manipulation for text distribution
- Implement lazy loading for large text content

### Browser Compatibility
- Ensure PDF generation works across modern browsers
- Test file download mechanisms on different platforms
- Verify memory limits on mobile devices
- Test performance on lower-end devices

### Accessibility
- Ensure page limit controls are keyboard accessible
- Provide screen reader support for page count estimates
- Include proper ARIA labels for new UI components
- Maintain focus management during PDF generation