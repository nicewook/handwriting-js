# Architecture Patterns & Design Guidelines

## Core Architecture Patterns

### 1. Layered Architecture
The application follows a clean layered architecture:
- **Presentation Layer**: React components in `app/components/`
- **Business Logic**: Server Actions in `app/actions/`
- **Service Layer**: PDF generation utilities in `lib/`
- **Data Layer**: Font metadata and constants

### 2. Server Actions Pattern
- **PDF Generation**: Uses Next.js Server Actions for server-side PDF processing
- **Form Handling**: Client components trigger server actions for file downloads
- **Error Handling**: Structured error responses with user-friendly messages

### 3. Font Management Strategy
```typescript
interface FontMetadata {
  filePath: string;     // Server-side (assets/fonts/)
  webFilePath: string;  // Client-side (public/fonts/)
}
```
- **Dual Storage**: Fonts stored in both locations for different use cases
- **Metadata-Driven**: Configuration-based font selection and loading

### 4. Typography System Design
- **4-Zone Guidelines**: Professional handwriting practice layout
- **Metric-Based Sizing**: Uses OpenType font metrics for accurate proportions
- **Dynamic Calculation**: Font size adjusted based on x-height and line spacing

## Design Patterns Used

### Component Composition
```typescript
// Parent component composes child components
<FontSelector onFontChange={setSelectedFontId} />
<SizeSelector onSizeChange={setSelectedSize} />
<PreviewSection selectedFontId={selectedFontId} />
```

### Hook Pattern
```typescript
// Custom hook for font loading
const { getFontState, isFontReady } = useFontLoader();
```

### Factory Pattern
- **PDF Generation**: Factory methods for creating PDF documents
- **Font Loading**: Factory functions for different font loading strategies

### Strategy Pattern
- **Font Loading**: Multiple strategies for font file resolution
- **Text Wrapping**: Different algorithms for text layout

## Error Handling Patterns

### Graceful Degradation
- **Font Loading Failures**: Fallback to default fonts
- **PDF Generation Errors**: User-friendly error messages in Korean
- **Unicode Encoding**: Fallback to ASCII text when encoding fails

### Defensive Programming
- **Input Validation**: Validate all parameters before PDF generation
- **File Existence**: Check font file accessibility before use
- **Type Safety**: Strict TypeScript typing throughout

## Performance Patterns

### Lazy Loading
- **Font Loading**: Fonts loaded on-demand for preview
- **Component Rendering**: Preview components update only when needed

### Caching Strategy
- **Font Metrics**: Cache OpenType parsing results
- **Preview State**: Avoid unnecessary re-renders

### Bundle Optimization
- **Font Subsetting**: Unicode subset embedding for PDF generation
- **Tree Shaking**: Ensure unused code is eliminated

## State Management Pattern
- **Local State**: React useState for component-level state
- **Prop Drilling**: Simple prop passing for state sharing
- **No Global State**: Deliberately avoided Redux/Zustand for simplicity

## API Design Patterns

### Server Action Signatures
```typescript
export async function generatePDF(params: PDFParams): Promise<PDFResult>
export async function validatePDFParams(params: PDFParams): Promise<ValidationResult>
```

### Error Response Structure
```typescript
interface PDFGenerationResult {
  success: boolean;
  error?: string;
  pdfBuffer?: Uint8Array;
}
```

## Security Patterns
- **Input Sanitization**: Validate all user inputs
- **File Path Security**: Prevent directory traversal attacks
- **Server-Side Processing**: PDF generation on server to prevent client manipulation