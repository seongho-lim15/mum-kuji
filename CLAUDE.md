# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 expense tracking application called "mum-kuji" with Korean language interface. The app helps users track expenses with predefined items, budget management, and visual analytics.

## Development Commands
- `npm run dev` - Start development server with Turbopack (default port: 3000)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Runtime**: React 19

## Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with global styles
│   ├── page.tsx            # Home page (renders ExpenseTracker)
│   ├── login/              # Login page directory
│   └── globals.css         # Global Tailwind styles
└── components/
    ├── ExpenseTracker.tsx  # Main expense tracking component (530 lines)
    └── LoginForm.tsx       # Login form component
```

## Key Architecture Notes
- **Single Page Application**: Main functionality is in `ExpenseTracker.tsx` component
- **Client-Side State**: Uses React hooks for state management (no external state library)
- **Korean Localization**: All UI text is in Korean
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Data Visualization**: Includes bar charts, line charts, and budget progress indicators

## TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled with `noImplicitAny: false`
- Turbopack enabled for faster builds and development

## ExpenseTracker Component Features
- Expense tracking with predefined and custom items
- Budget management with progress visualization
- Time-based filtering (day, week, month, year)
- Chart views (list and graph modes)
- Categories: 만화 (manga), 음료 (drinks), 식사 (meals), 교통 (transport), 기타 (others)
- Item search and auto-completion
- Responsive mobile UI with modal forms

## Development Notes
- Uses Turbopack for improved build performance
- Tailwind CSS 4 with PostCSS configuration
- ESLint configured with Next.js TypeScript rules
- No test framework currently configured
- All user-facing text is in Korean