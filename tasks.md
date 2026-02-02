# NativePace - Development Task List

## Phase 1: Project Setup & Foundation

### 1.1 Project Initialization
- [ ] **Task 1.1.1**: Initialize Next.js 14 project with App Router and TypeScript
  - Create new Next.js app with `create-next-app`
  - Configure TypeScript strict mode
  - Verify project runs on localhost
  - *Test*: `npm run dev` starts without errors

- [ ] **Task 1.1.2**: Configure Material UI and theme
  - Install Material UI packages (`@mui/material`, `@emotion/react`, `@emotion/styled`)
  - Create theme configuration with color palette from spec (primary blue #3b82f6, success, error, neutrals)
  - Set up ThemeProvider in root layout
  - *Test*: Render a themed MUI Button component

- [ ] **Task 1.1.3**: Set up project folder structure
  - Create directories: `components/`, `lib/`, `types/`, `content/`, `public/audio/`
  - Create subdirectories per architecture spec
  - *Test*: All directories exist as specified in architecture

- [ ] **Task 1.1.4**: Configure environment variables
  - Create `.env.local` template with all required variables
  - Document all environment variables in `.env.example`
  - *Test*: Environment variables are accessible in code

### 1.2 TypeScript Types
- [ ] **Task 1.2.1**: Create Pattern types (`types/pattern.ts`)
  - Define `Pattern` interface with all fields
  - Define `PatternCategory` union type
  - *Test*: Types compile without errors

- [ ] **Task 1.2.2**: Create Exercise types (`types/exercise.ts`)
  - Define `ExerciseType` union type
  - Define `Exercise` interface
  - Define `ExerciseAttempt` interface
  - *Test*: Types compile without errors

- [ ] **Task 1.2.3**: Create Progress types (`types/progress.ts`)
  - Define `UserPatternProgress` interface
  - Define `UserStats` interface
  - *Test*: Types compile without errors

- [ ] **Task 1.2.4**: Create User types (`types/user.ts`)
  - Define `SubscriptionTier` type
  - Define `UserProfile` interface
  - *Test*: Types compile without errors

### 1.3 Database Setup (Supabase)
- [ ] **Task 1.3.1**: Initialize Supabase project and client
  - Create Supabase project
  - Install `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
  - Create `lib/supabase/client.ts` for browser client
  - Create `lib/supabase/server.ts` for server client
  - *Test*: Supabase client connects successfully

- [ ] **Task 1.3.2**: Create `profiles` table with RLS
  - Write SQL migration for profiles table
  - Add RLS policies for read/update own profile
  - *Test*: Can insert and read profile via Supabase dashboard

- [ ] **Task 1.3.3**: Create `patterns` table
  - Write SQL migration for patterns table with all fields
  - Add indexes for common queries
  - *Test*: Can insert and query patterns

- [ ] **Task 1.3.4**: Create `user_pattern_progress` table with RLS
  - Write SQL migration with foreign keys
  - Add unique constraint on (user_id, pattern_id)
  - Add RLS policies
  - Add indexes for performance
  - *Test*: RLS policies work correctly

- [ ] **Task 1.3.5**: Create `exercise_attempts` table with RLS
  - Write SQL migration
  - Add RLS policies
  - Add indexes
  - *Test*: Can insert attempts for authenticated user

- [ ] **Task 1.3.6**: Create `practice_sessions` table with RLS
  - Write SQL migration
  - Add RLS policies
  - *Test*: Can create and update sessions

### 1.4 Structured Logging Setup
- [ ] **Task 1.4.1**: Create logging utility
  - Create `lib/utils/logger.ts` with structured logging functions
  - Support log levels (debug, info, warn, error)
  - Include timestamp and context in all logs
  - *Test*: Logger outputs structured JSON format

---

## Phase 2: Authentication

### 2.1 Auth Configuration
- [ ] **Task 2.1.1**: Configure Supabase Auth providers
  - Enable email/password authentication
  - Configure Google OAuth provider
  - Set up redirect URLs
  - *Test*: Auth providers visible in Supabase dashboard

- [ ] **Task 2.1.2**: Create auth middleware (`middleware.ts`)
  - Implement session checking
  - Define protected routes array
  - Redirect unauthenticated users to login
  - *Test*: Unauthenticated access to /dashboard redirects to /login

### 2.2 Auth Pages
- [ ] **Task 2.2.1**: Create auth layout (`app/(auth)/layout.tsx`)
  - Simple centered layout for auth pages
  - NativePace branding/logo
  - *Test*: Layout renders correctly

- [ ] **Task 2.2.2**: Create signup page (`app/(auth)/signup/page.tsx`)
  - Email/password form with validation
  - Google OAuth button
  - Link to login page
  - Call `signUpWithEmail` function
  - Create profile on successful signup
  - *Test*: Can create new account and profile is created

- [ ] **Task 2.2.3**: Create login page (`app/(auth)/login/page.tsx`)
  - Email/password form
  - Google OAuth button
  - Link to signup page
  - Error handling for invalid credentials
  - *Test*: Can log in with valid credentials

- [ ] **Task 2.2.4**: Create auth callback handler (`app/auth/callback/route.ts`)
  - Handle OAuth redirects
  - Exchange code for session
  - Redirect to dashboard
  - *Test*: Google OAuth flow completes successfully

- [ ] **Task 2.2.5**: Create auth helper functions (`lib/supabase/auth.ts`)
  - `signUpWithEmail` function
  - `signInWithEmail` function
  - `signInWithGoogle` function
  - `signOut` function
  - *Test*: All auth functions work correctly

---

## Phase 3: Core UI Components

### 3.1 Base UI Components
- [ ] **Task 3.1.1**: Create Button component (`components/ui/Button.tsx`)
  - Wrap MUI Button with app styling
  - Support variants: primary, secondary, outline
  - Support sizes: small, medium, large
  - *Test*: All variants render correctly

- [ ] **Task 3.1.2**: Create Card component (`components/ui/Card.tsx`)
  - Reusable card container
  - Support optional header, padding variants
  - *Test*: Card renders with content

- [ ] **Task 3.1.3**: Create Progress component (`components/ui/Progress.tsx`)
  - Progress bar with percentage
  - Configurable color
  - Optional label
  - *Test*: Progress displays correct percentage

- [ ] **Task 3.1.4**: Create Modal component (`components/ui/Modal.tsx`)
  - Overlay modal with close button
  - Support for custom content
  - Keyboard escape to close
  - *Test*: Modal opens and closes correctly

### 3.2 Audio Components
- [ ] **Task 3.2.1**: Create AudioPlayer component (`components/ui/AudioPlayer.tsx`)
  - Dual audio support (slow/fast URLs)
  - Play/pause controls
  - Visual feedback during playback
  - Preload audio on mount
  - Keyboard shortcuts (S for slow, F for fast, Space for replay)
  - *Test*: Audio plays correctly, keyboard shortcuts work

- [ ] **Task 3.2.2**: Create audio store (`lib/stores/audioStore.ts`)
  - Zustand store for audio state
  - Track current playing audio
  - Playback state management
  - *Test*: Store updates on play/pause

### 3.3 Layout Components
- [ ] **Task 3.3.1**: Create Header component (`components/layout/Header.tsx`)
  - Logo/brand name
  - Navigation links (logged in state)
  - User menu with logout
  - *Test*: Header renders with correct links

- [ ] **Task 3.3.2**: Create MobileNav component (`components/layout/MobileNav.tsx`)
  - Bottom navigation bar
  - Icons for: Dashboard, Learn, Review, Profile
  - Active state highlighting
  - *Test*: Navigation works on mobile viewport

- [ ] **Task 3.3.3**: Create main layout (`app/(main)/layout.tsx`)
  - Include Header
  - Include MobileNav (mobile only)
  - Auth check wrapper
  - *Test*: Protected pages render with layout

---

## Phase 4: State Management & Utilities

### 4.1 Zustand Stores
- [ ] **Task 4.1.1**: Create user store (`lib/stores/userStore.ts`)
  - User profile state
  - Subscription status
  - Fetch and update profile functions
  - *Test*: Store hydrates with user data on login

- [ ] **Task 4.1.2**: Create progress store (`lib/stores/progressStore.ts`)
  - User pattern progress state
  - Stats aggregation
  - Sync with Supabase
  - *Test*: Progress updates persist to database

### 4.2 Utility Functions
- [ ] **Task 4.2.1**: Implement SM-2 spaced repetition algorithm (`lib/utils/spaced-repetition.ts`)
  - `calculateSM2` function per spec
  - `exerciseResultToQuality` function
  - Unit tests for algorithm correctness
  - *Test*: Algorithm produces correct intervals for all quality scores

- [ ] **Task 4.2.2**: Create string matching utility (`lib/utils/string-matching.ts`)
  - Fuzzy match for dictation answers
  - Normalize punctuation and case
  - Calculate similarity score
  - *Test*: Accepts reasonable answer variations

- [ ] **Task 4.2.3**: Create audio helpers (`lib/utils/audio-helpers.ts`)
  - Preload audio function
  - Get audio duration
  - Format time display
  - *Test*: Audio preloads successfully

---

## Phase 5: Pattern Content & Data

### 5.1 Pattern Data
- [ ] **Task 5.1.1**: Create pattern constants (`lib/constants/patterns.ts`)
  - Pattern category definitions
  - Category display names and icons
  - *Test*: Constants export correctly

- [ ] **Task 5.1.2**: Create level constants (`lib/constants/levels.ts`)
  - Level definitions (1-6)
  - Pattern ranges per level
  - Premium gate levels (3-6)
  - *Test*: Constants export correctly

- [ ] **Task 5.1.3**: Create weak-forms pattern data (`content/patterns/weak-forms.json`)
  - First 10 weak-form patterns with all fields
  - *Test*: JSON parses correctly, matches Pattern type

- [ ] **Task 5.1.4**: Create reductions pattern data (`content/patterns/reductions.json`)
  - First 10 reduction patterns (wanna, gonna, hafta, etc.)
  - *Test*: JSON parses correctly

- [ ] **Task 5.1.5**: Create pattern seed script (`scripts/seed-patterns.ts`)
  - Read JSON pattern files
  - Insert into Supabase patterns table
  - Handle updates for existing patterns
  - *Test*: Patterns appear in database after running

### 5.2 Pattern API
- [ ] **Task 5.2.1**: Create patterns API route (`app/api/patterns/route.ts`)
  - GET: Fetch patterns with filtering (level, category)
  - Support pagination
  - *Test*: API returns correct patterns

---

## Phase 6: Learning Flow

### 6.1 Learning Pages
- [ ] **Task 6.1.1**: Create learn index page (`app/(main)/learn/page.tsx`)
  - Display all levels with progress
  - Show locked/unlocked state
  - Premium badge for levels 3-6
  - *Test*: Page displays all levels with correct lock states

- [ ] **Task 6.1.2**: Create level detail page (`app/(main)/learn/[levelId]/page.tsx`)
  - List patterns in level
  - Show completion status per pattern
  - "Continue" button to next unlearned pattern
  - *Test*: Page shows patterns for selected level

- [ ] **Task 6.1.3**: Create pattern view component (`components/exercises/PatternView.tsx`)
  - Display pattern title and description
  - Show phonetic transcriptions
  - AudioPlayer with slow/fast versions
  - Tips section
  - "Got it! Next" button
  - *Test*: Pattern information displays correctly

### 6.2 Exercise Components
- [ ] **Task 6.2.1**: Create AudioComparison exercise (`components/exercises/AudioComparison.tsx`)
  - Display pattern info
  - Slow and fast audio buttons
  - "Understood" / "Replay" options
  - Track completion
  - *Test*: Audio plays, completion tracked

- [ ] **Task 6.2.2**: Create ListeningDiscrimination exercise (`components/exercises/ListeningDiscrimination.tsx`)
  - Play audio clip
  - Display 3-4 answer options
  - Handle selection and submission
  - Show correct/incorrect feedback
  - *Test*: Selection works, feedback displays

- [ ] **Task 6.2.3**: Create DictationChallenge exercise (`components/exercises/DictationChallenge.tsx`)
  - Play audio with replay limit
  - Text input for user answer
  - Fuzzy matching on submit
  - Highlight patterns in correct answer
  - *Test*: Answer matching works with variations

- [ ] **Task 6.2.4**: Create SpeedTraining exercise (`components/exercises/SpeedTraining.tsx`)
  - Play audio at 0.75x, 1.0x, 1.25x speeds
  - User marks comprehension at each speed
  - Track comfortable speed
  - *Test*: Speed variations play correctly

### 6.3 Exercise Flow
- [ ] **Task 6.3.1**: Create practice page (`app/(main)/practice/page.tsx`)
  - Load exercises for current pattern
  - Cycle through exercise types
  - Track progress within session
  - Show completion summary
  - *Test*: Exercise flow completes successfully

- [ ] **Task 6.3.2**: Create exercise feedback modal
  - Correct answer celebration
  - Incorrect answer with explanation
  - Pattern explanation in feedback
  - Continue button
  - *Test*: Feedback displays appropriately

---

## Phase 7: Progress Tracking & Review

### 7.1 Progress API
- [ ] **Task 7.1.1**: Create progress API route (`app/api/progress/route.ts`)
  - POST: Record exercise attempt
  - Update user_pattern_progress with SM-2
  - Update practice session stats
  - *Test*: Progress saves correctly to database

- [ ] **Task 7.1.2**: Create review queue utility (`lib/utils/review-queue.ts`)
  - `getDuePatterns` function
  - `getNewPatternsForLevel` function
  - *Test*: Returns correct patterns based on next_review_at

### 7.2 Review System
- [ ] **Task 7.2.1**: Create review page (`app/(main)/review/page.tsx`)
  - Fetch due patterns
  - Display count by category
  - "Start Review" button
  - Handle empty state (no reviews due)
  - *Test*: Shows due patterns, starts review session

- [ ] **Task 7.2.2**: Create review session flow
  - Load due patterns
  - Present exercises for each pattern
  - Update SM-2 values after each answer
  - Show session summary on completion
  - *Test*: Review updates next_review_at correctly

### 7.3 Streak Tracking
- [ ] **Task 7.3.1**: Create streak calculation utility
  - Calculate current streak from last_practice_date
  - Update streak on practice completion
  - Handle streak break (reset to 0)
  - *Test*: Streak calculates correctly across days

- [ ] **Task 7.3.2**: Create StreakCard component (`components/dashboard/StreakCard.tsx`)
  - Display current streak
  - Fire emoji or similar visual
  - *Test*: Displays correct streak count

---

## Phase 8: Dashboard

### 8.1 Dashboard Components
- [ ] **Task 8.1.1**: Create dashboard page (`app/(main)/dashboard/page.tsx`)
  - Greeting with user name
  - StreakCard
  - Overall progress card
  - Continue learning CTA
  - Review due section
  - Progress chart
  - *Test*: Dashboard renders with user data

- [ ] **Task 8.1.2**: Create ProgressChart component (`components/dashboard/ProgressChart.tsx`)
  - Weekly practice visualization
  - Patterns learned over time
  - Use simple chart library or custom SVG
  - *Test*: Chart renders with data

- [ ] **Task 8.1.3**: Create PatternGrid component (`components/dashboard/PatternGrid.tsx`)
  - Visual grid of patterns by category
  - Color-coded by mastery level
  - *Test*: Grid displays all patterns with correct colors

### 8.2 Stats Aggregation
- [ ] **Task 8.2.1**: Create stats calculation functions
  - Total patterns learned
  - Average accuracy
  - Mastery by category
  - Total practice time
  - *Test*: Stats calculate correctly from progress data

---

## Phase 9: Landing Page

- [ ] **Task 9.1**: Create landing page (`app/page.tsx`)
  - Hero section with headline
  - Interactive audio demo (slow vs fast)
  - "Start Learning Free" CTA
  - Problem/solution explanation
  - How it works section
  - Social proof (country flags)
  - *Test*: Page renders all sections

- [ ] **Task 9.2**: Create pricing section component
  - Free tier features
  - Premium tier features and price
  - CTA buttons
  - *Test*: Pricing displays correctly

---

## Phase 10: Payment Integration

### 10.1 Lemon Squeezy Setup
- [ ] **Task 10.1.1**: Create Lemon Squeezy utility (`lib/payments/lemonsqueezy.ts`)
  - `createCheckout` function
  - Product variant IDs configuration
  - *Test*: Checkout URL generated correctly

- [ ] **Task 10.1.2**: Create webhook handler (`app/api/webhook/route.ts`)
  - Verify webhook signature
  - Handle `subscription_created` event
  - Handle `subscription_cancelled` event
  - Handle `order_created` for lifetime
  - Update user profile subscription_tier
  - *Test*: Webhook updates profile correctly (use test events)

### 10.2 Premium Gating
- [ ] **Task 10.2.1**: Update middleware for premium routes
  - Check subscription_tier for levels 3-6
  - Redirect to pricing if not premium
  - *Test*: Free users cannot access premium levels

- [ ] **Task 10.2.2**: Create pricing page (`app/pricing/page.tsx`)
  - Display pricing tiers (PPP variants)
  - Checkout buttons
  - Feature comparison
  - *Test*: Page renders, checkout flow initiates

---

## Phase 11: PWA Configuration

- [ ] **Task 11.1**: Create PWA manifest (`public/manifest.json`)
  - App name, short name, description
  - Icons configuration
  - Theme color
  - *Test*: Manifest valid per PWA checklist

- [ ] **Task 11.2**: Configure next-pwa
  - Install and configure next-pwa package
  - Set up audio caching strategy
  - Disable in development
  - *Test*: Service worker registers in production build

- [ ] **Task 11.3**: Create app icons
  - 192x192 icon
  - 512x512 icon
  - Maskable icon
  - *Test*: Icons display correctly on mobile

---

## Phase 12: Analytics

- [ ] **Task 12.1**: Create analytics utility (`lib/analytics/posthog.ts`)
  - `initAnalytics` function
  - `trackEvent` function
  - `identifyUser` function
  - Disable in development
  - *Test*: Events fire in production mode

- [ ] **Task 12.2**: Create analytics events constants (`lib/analytics/events.ts`)
  - Define all event names per spec
  - *Test*: Constants export correctly

- [ ] **Task 12.3**: Integrate analytics in key flows
  - Signup/login events
  - Pattern/exercise events
  - Checkout events
  - *Test*: Events appear in PostHog dashboard

---

## Phase 13: Audio Content

- [ ] **Task 13.1**: Create audio generation script (`scripts/generate-audio.ts`)
  - Read patterns from JSON/database
  - Generate slow and fast versions using edge-tts
  - Output to `public/audio/patterns/`
  - *Test*: Audio files generated for sample patterns

- [ ] **Task 13.2**: Generate audio for Level 1 patterns (20 patterns)
  - Slow and fast versions for each
  - Verify audio quality
  - *Test*: All Level 1 audio files exist and play

- [ ] **Task 13.3**: Generate audio for Level 2 patterns (30 patterns)
  - Slow and fast versions for each
  - *Test*: All Level 2 audio files exist and play

---

## Phase 14: Polish & Optimization

- [ ] **Task 14.1**: Mobile responsive polish
  - Test all pages on mobile viewports
  - Fix any layout issues
  - Ensure tap targets are 44px minimum
  - *Test*: All pages work on 375px width

- [ ] **Task 14.2**: Performance optimization
  - Implement audio preloading
  - Optimize images
  - Check Core Web Vitals
  - *Test*: Lighthouse score > 90

- [ ] **Task 14.3**: Accessibility audit
  - Add aria labels
  - Ensure keyboard navigation
  - Test with screen reader
  - *Test*: No critical accessibility issues

- [ ] **Task 14.4**: Error handling
  - Add error boundaries
  - Handle API failures gracefully
  - User-friendly error messages
  - *Test*: Errors don't crash the app

---

## Phase 15: Testing & Launch Prep

- [ ] **Task 15.1**: Write unit tests for utilities
  - SM-2 algorithm tests
  - String matching tests
  - Streak calculation tests
  - *Test*: All utility tests pass

- [ ] **Task 15.2**: Write integration tests for auth flow
  - Signup flow test
  - Login flow test
  - Protected route test
  - *Test*: Auth tests pass

- [ ] **Task 15.3**: Write integration tests for exercise flow
  - Complete exercise submission
  - Progress tracking
  - *Test*: Exercise tests pass

- [ ] **Task 15.4**: Set up error monitoring (Sentry)
  - Install and configure Sentry
  - Set up source maps
  - *Test*: Test error appears in Sentry

- [ ] **Task 15.5**: SEO optimization
  - Add meta tags to all pages
  - Create robots.txt
  - Create sitemap.xml
  - *Test*: SEO audit passes

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 14 | Project setup, types, database |
| 2 | 5 | Authentication |
| 3 | 8 | Core UI components |
| 4 | 5 | State management & utilities |
| 5 | 6 | Pattern content & data |
| 6 | 7 | Learning flow |
| 7 | 5 | Progress tracking & review |
| 8 | 4 | Dashboard |
| 9 | 2 | Landing page |
| 10 | 4 | Payment integration |
| 11 | 3 | PWA configuration |
| 12 | 3 | Analytics |
| 13 | 3 | Audio content |
| 14 | 4 | Polish & optimization |
| 15 | 5 | Testing & launch prep |

**Total: 78 tasks**
