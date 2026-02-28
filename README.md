# Foundation Review App 🚀

A premium, agent-driven assessment platform for managing student module reviews. Features a seamless floating assessment window with live timers, performance tracking, and automated report generation.

## Key Features
- **Global Assessment HUD**: Persistent floating window that stays active across page navigations.
- **Triple-Mode View**: Switch between Mini, Floating, and Full Screen modes for the best assessment focus.
- **Master Registry**: Manage student assessments, batches, and modules in a centralized database.
- **Question Bank**: Organize theory and practical questions per module.
- **Safe Boundaries**: Viewport-constrained drag behavior for a premium UX.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Vanilla CSS + Tailwind-like utility patterns
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

1. **Setup Environment**:
   ```bash
   cp .env.example .env.local
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure
- `app/`: Next.js pages and API routes
- `components/`: Reusable UI components (including the Global Assessment Provider)
- `lib/`: API clients and utility functions
- `types/`: Global TypeScript definitions
