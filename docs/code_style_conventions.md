# Code Style & Conventions

## Language Standards
- **TypeScript strict mode** enabled
- **Interface-based typing** for component props and data structures
- **Named exports** preferred over default exports (except for page components)
- **Explicit typing** for function parameters and return values

## File Organization
- **Component files**: PascalCase naming (e.g., `FontSelector.tsx`)
- **Utility files**: kebab-case naming (e.g., `pdf-utils.ts`)
- **Directory structure**: Logical grouping by feature/type
  - `app/components/` - React components
  - `app/actions/` - Server Actions
  - `lib/` - Utility functions and configurations
  - `lib/hooks/` - Custom React hooks

## Import Conventions
- **Absolute imports** using `@/` alias
- **Grouped imports**: External packages → Internal modules → Relative imports
- **Type-only imports** where appropriate

## Component Patterns
- **'use client'** directive for client components
- **Server Actions** for server-side operations
- **Props interfaces** with descriptive names ending in `Props`
- **Default parameter values** in destructured props

## Naming Conventions
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Functions**: camelCase with descriptive verbs
- **Files**: PascalCase for components, kebab-case for utilities

## Comments
- **Korean comments** for business logic explanations
- **English comments** for technical implementation details
- **JSDoc comments** for exported functions and interfaces

## State Management
- **useState** for local component state
- **No external state management** - kept simple with prop drilling
- **Controlled components** pattern for form inputs

## Error Handling
- **Explicit error types** in Server Actions
- **Graceful fallbacks** in PDF generation
- **User-friendly error messages** in Korean