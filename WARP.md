# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.7 travel website project built with TypeScript, React 19, and Tailwind CSS 4. It uses the modern App Router architecture and is bootstrapped from create-next-app.

## Development Commands

### Core Development
- `npm run dev` - Start the development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the production application
- `npm start` - Start the production server (requires build first)
- `npm run lint` - Run ESLint to check code quality

### Testing
No testing framework is currently configured in this project.

## Architecture and Structure

### App Router Structure
This project uses Next.js App Router (app directory) with the following structure:

- `app/` - Main application directory using App Router
  - `layout.tsx` - Root layout component with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global CSS with Tailwind imports and CSS variables
  - `favicon.ico` - Site favicon

### Key Technologies
- **Next.js 15.4.7** - React framework with App Router
- **React 19.1.0** - UI library (latest version)
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework (latest version)
- **ESLint 9** - Code linting with Next.js configuration
- **Turbopack** - Fast bundler for development (enabled by default)

### Styling System
- Uses Tailwind CSS 4 with PostCSS
- Implements CSS variables for theming with dark mode support
- Geist and Geist Mono fonts from Google Fonts
- Custom color tokens: `--background` and `--foreground` with dark mode variants

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` points to project root
- Next.js plugin configured for optimal development experience

## Key Files and Patterns

### Layout Pattern
The root layout (`app/layout.tsx`) sets up:
- Font variables for Geist Sans and Geist Mono
- Global CSS imports
- HTML structure with proper font class application

### Page Components
- Pages are React Server Components by default
- Use Next.js Image component for optimized images
- Implement responsive design with Tailwind CSS

### Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript configuration with Next.js optimizations
- `eslint.config.mjs` - ESLint flat config extending Next.js rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

## Development Notes

### Hot Reloading
The development server uses Turbopack for fast hot module replacement. Changes to `app/page.tsx` or other components will be reflected immediately.

### Image Optimization
Use the Next.js `Image` component from `next/image` for automatic optimization. Static images are stored in the `public/` directory.

### Font Optimization
Fonts are loaded using `next/font/google` for automatic optimization and preloading.
