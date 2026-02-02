# NativePace - Understanding Fast Native Speech
## Product Specification for Claude Code

**Version:** 1.0 MVP  
**Last Updated:** January 2025  
**Target Launch:** 8 weeks from development start

---

## 1. Executive Summary

### Product Vision
NativePace is a web application that teaches English learners to understand fast native speech by systematically training them on connected speech patterns—the reductions, contractions, and linking that make "What do you want to do?" sound like "Whaddya wanna do?"

### Problem Statement
English learners spend years studying grammar and vocabulary but still can't understand native speakers in real conversations, movies, or podcasts. This happens because textbooks teach "dictionary pronunciation" while natives use connected speech patterns that are never formally taught.

### Solution
A focused training app that teaches the ~200 most common connected speech patterns through:
1. Audio comparison (slow/clear vs. natural speed)
2. Listening discrimination exercises
3. Dictation challenges
4. Spaced repetition for retention

### Success Metric
$200 MRR within 6 months of launch

---

## 2. Target Users

### Primary Persona: "The Frustrated Intermediate"
- **English Level:** B1-B2 (intermediate)
- **Age:** 18-35
- **Location:** India, Brazil, Vietnam, Indonesia, Latin America, Eastern Europe
- **Pain:** "I understand my teacher but not movies or real conversations"
- **Goal:** Understand native speakers at normal speed
- **Willing to pay:** $2-5/month (PPP adjusted)

### Secondary Persona: "The Test Prepper"
- Preparing for PTE, IELTS, or TOEFL
- Needs listening comprehension improvement
- Time-constrained, wants efficient practice

---

## 3. Core Features (MVP Scope)

### 3.1 Pattern Library
A structured curriculum of connected speech patterns organized by type:

```
PATTERN CATEGORIES:
├── Weak Forms (40 patterns)
│   ├── Articles: "a" → /ə/, "the" → /ðə/
│   ├── Pronouns: "him" → /ɪm/, "her" → /ər/
│   ├── Prepositions: "to" → /tə/, "for" → /fər/
│   └── Auxiliaries: "have" → /əv/, "can" → /kən/
│
├── Contractions & Reductions (50 patterns)
│   ├── "going to" → "gonna"
│   ├── "want to" → "wanna"
│   ├── "have to" → "hafta"
│   ├── "got to" → "gotta"
│   └── "kind of" → "kinda"
│
├── Linking Patterns (30 patterns)
│   ├── Consonant-Vowel: "turn_off" → "tur-noff"
│   ├── Vowel-Vowel: "go_out" → "go-wout"
│   └── Consonant-Consonant: "hot_dog" → "ho-dog"
│
├── Elision/Deletion (25 patterns)
│   ├── T-deletion: "internet" → "innernet"
│   ├── D-deletion: "and" → "an"
│   └── H-deletion: "tell him" → "tell 'im"
│
├── Assimilation (25 patterns)
│   ├── "don't you" → "doncha"
│   ├── "would you" → "wouldja"
│   └── "got you" → "gotcha"
│
└── Flapping (15 patterns)
    ├── "water" → "wader"
    ├── "better" → "bedder"
    └── "little" → "liddle"
```

### 3.2 Exercise Types

#### Type A: Audio Comparison
- Play SLOW version (clear, dictionary pronunciation)
- Play FAST version (natural native speed)
- User clicks "Understood" or "Replay"
- Show written explanation of the pattern

#### Type B: Listening Discrimination
- Play audio clip containing the pattern
- User selects which pattern they heard from 3-4 options
- Immediate feedback with explanation

#### Type C: Dictation Challenge
- Play natural-speed sentence containing studied patterns
- User types what they hear
- Accept reasonable variations (punctuation, minor spelling)
- Highlight patterns in the correct answer

#### Type D: Speed Training
- Play same sentence at increasing speeds: 0.75x → 1.0x → 1.25x
- User marks comprehension at each speed
- Track "comfortable speed" improvement over time

### 3.3 Learning Path
```
PROGRESSION SYSTEM:
├── Level 1: Foundation (Patterns 1-20)
│   └── Unlock: Free
├── Level 2: Common Reductions (Patterns 21-50)
│   └── Unlock: Free (with account)
├── Level 3: Linking Mastery (Patterns 51-80)
│   └── Unlock: Premium
├── Level 4: Advanced Patterns (Patterns 81-120)
│   └── Unlock: Premium
├── Level 5: Native Speed (Patterns 121-150)
│   └── Unlock: Premium
└── Level 6: Mastery (Patterns 151-185)
    └── Unlock: Premium
```

### 3.4 Spaced Repetition System
- SM-2 algorithm implementation
- Review due patterns daily
- Track pattern mastery (0-100%)
- "Streak" system for engagement

### 3.5 Progress Dashboard
- Patterns learned vs. total
- Current streak
- Listening speed improvement graph
- Weekly practice time
- Mastery percentage by category

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Best PWA support, SSR, great DX |
| **Language** | TypeScript | Type safety, better maintainability |
| **Styling** | Material UI | Rapid development, small bundle |
| **State** | Zustand | Simpler than Redux, good persistence |
| **Database** | Supabase (PostgreSQL) | Free tier, auth included, realtime |
| **Auth** | Supabase Auth | Email/password, Google, magic link |
| **Hosting** | Vercel | Free tier, automatic CI/CD |
| **Audio** | HTML5 Audio API | Native, no dependencies |
| **Analytics** | PostHog | Free tier, product analytics |
| **Payments** | Lemon Squeezy | PPP support, tax handling |
MCP Server
Use structured logging for all inputs and outputs to functions across the codebase

### 4.2 Project Structure

```
nativepace/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── learn/
│   │   │   ├── [levelId]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── practice/
│   │   │   └── page.tsx
│   │   ├── review/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── progress/
│   │   │   └── route.ts
│   │   ├── webhook/
│   │   │   └── route.ts
│   │   └── patterns/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Progress.tsx
│   │   ├── Modal.tsx
│   │   └── AudioPlayer.tsx
│   ├── exercises/
│   │   ├── AudioComparison.tsx
│   │   ├── ListeningDiscrimination.tsx
│   │   ├── DictationChallenge.tsx
│   │   └── SpeedTraining.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   └── dashboard/
│       ├── StreakCard.tsx
│       ├── ProgressChart.tsx
│       └── PatternGrid.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stores/
│   │   ├── userStore.ts
│   │   ├── progressStore.ts
│   │   └── audioStore.ts
│   ├── utils/
│   │   ├── spaced-repetition.ts
│   │   ├── audio-helpers.ts
│   │   └── string-matching.ts
│   └── constants/
│       ├── patterns.ts
│       └── levels.ts
├── content/
│   ├── patterns/
│   │   ├── weak-forms.json
│   │   ├── reductions.json
│   │   ├── linking.json
│   │   ├── elision.json
│   │   ├── assimilation.json
│   │   └── flapping.json
│   └── exercises/
│       └── [patternId].json
├── public/
│   ├── audio/
│   │   ├── patterns/
│   │   │   ├── [patternId]-slow.mp3
│   │   │   └── [patternId]-fast.mp3
│   │   └── exercises/
│   │       └── [exerciseId].mp3
│   ├── icons/
│   └── manifest.json
├── types/
│   ├── pattern.ts
│   ├── exercise.ts
│   ├── user.ts
│   └── progress.ts
└── scripts/
    ├── generate-audio.ts
    └── seed-patterns.ts
```

### 4.3 Database Schema (Supabase)

```sql
-- Users (handled by Supabase Auth, extended with profile)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  native_language TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'premium', 'lifetime'
  subscription_expires_at TIMESTAMP,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pattern definitions (seeded, not user-editable)
CREATE TABLE patterns (
  id TEXT PRIMARY KEY, -- e.g., 'weak-form-to'
  category TEXT NOT NULL, -- 'weak-forms', 'reductions', etc.
  level INTEGER NOT NULL, -- 1-6
  title TEXT NOT NULL, -- "The weak form of 'to'"
  description TEXT NOT NULL,
  phonetic_clear TEXT, -- /tuː/
  phonetic_reduced TEXT, -- /tə/
  example_sentence TEXT, -- "I want to go home"
  example_transcription TEXT, -- "I wanna go home"
  audio_slow_url TEXT,
  audio_fast_url TEXT,
  tips TEXT[], -- Learning tips array
  difficulty INTEGER DEFAULT 1, -- 1-5
  order_index INTEGER NOT NULL
);

-- User progress on each pattern
CREATE TABLE user_pattern_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_id TEXT REFERENCES patterns(id),
  mastery_score INTEGER DEFAULT 0, -- 0-100
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP,
  next_review_at TIMESTAMP,
  ease_factor REAL DEFAULT 2.5, -- SM-2 algorithm
  interval_days INTEGER DEFAULT 1, -- SM-2 algorithm
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, pattern_id)
);

-- Exercise attempts (for analytics)
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_id TEXT REFERENCES patterns(id),
  exercise_type TEXT NOT NULL, -- 'comparison', 'discrimination', 'dictation', 'speed'
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  user_input TEXT, -- For dictation exercises
  created_at TIMESTAMP DEFAULT NOW()
);

-- Practice sessions (for streak tracking)
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  patterns_practiced INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pattern_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own progress" ON user_pattern_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own attempts" ON exercise_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON practice_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_progress_user_next_review ON user_pattern_progress(user_id, next_review_at);
CREATE INDEX idx_progress_user_pattern ON user_pattern_progress(user_id, pattern_id);
CREATE INDEX idx_attempts_user_created ON exercise_attempts(user_id, created_at);
```

### 4.4 TypeScript Types

```typescript
// types/pattern.ts
export interface Pattern {
  id: string;
  category: PatternCategory;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  description: string;
  phoneticClear: string;
  phoneticReduced: string;
  exampleSentence: string;
  exampleTranscription: string;
  audioSlowUrl: string;
  audioFastUrl: string;
  tips: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  orderIndex: number;
}

export type PatternCategory = 
  | 'weak-forms'
  | 'reductions'
  | 'linking'
  | 'elision'
  | 'assimilation'
  | 'flapping';

// types/exercise.ts
export type ExerciseType = 
  | 'comparison'
  | 'discrimination'
  | 'dictation'
  | 'speed';

export interface Exercise {
  id: string;
  patternId: string;
  type: ExerciseType;
  audioUrl: string;
  correctAnswer: string;
  options?: string[]; // For discrimination
  acceptableAnswers?: string[]; // For dictation
  speedLevels?: number[]; // For speed training
}

export interface ExerciseAttempt {
  id: string;
  userId: string;
  patternId: string;
  exerciseType: ExerciseType;
  isCorrect: boolean;
  responseTimeMs: number;
  userInput?: string;
  createdAt: Date;
}

// types/progress.ts
export interface UserPatternProgress {
  id: string;
  userId: string;
  patternId: string;
  masteryScore: number; // 0-100
  timesPracticed: number;
  timesCorrect: number;
  lastPracticedAt: Date | null;
  nextReviewAt: Date | null;
  easeFactor: number; // SM-2
  intervalDays: number; // SM-2
}

export interface UserStats {
  patternsLearned: number;
  patternsTotal: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeMinutes: number;
  averageAccuracy: number;
  masteryByCategory: Record<PatternCategory, number>;
}

// types/user.ts
export type SubscriptionTier = 'free' | 'premium' | 'lifetime';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  nativeLanguage: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  streakCurrent: number;
  streakLongest: number;
  lastPracticeDate: Date | null;
  createdAt: Date;
}
```

---

## 5. UI/UX Specifications

### 5.1 Design Principles
1. **Minimalist** - Focus on audio and learning, no visual clutter
2. **Mobile-first** - 70%+ users will be on mobile
3. **Fast** - Audio must load instantly, no spinners during practice
4. **Accessible** - High contrast, large tap targets, screen reader support

### 5.2 Color Palette
```css
:root {
  /* Primary - Calming blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Success - Green */
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Error - Red */
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

### 5.3 Key Screens

#### Landing Page (/)
```
┌─────────────────────────────────────┐
│  🎧 NativePace                  [Login]│
├─────────────────────────────────────┤
│                                     │
│   Finally understand                │
│   native English speakers           │
│                                     │
│   Learn the 200 sound patterns      │
│   that textbooks don't teach        │
│                                     │
│   [▶ Hear the difference]           │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ "What do you want to do?"   │   │
│   │   [Slow 🔊]    [Fast 🔊]    │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Start Learning Free →]           │
│                                     │
├─────────────────────────────────────┤
│   Trusted by learners from:         │
│   🇮🇳 🇧🇷 🇻🇳 🇮🇩 🇲🇽 🇵🇱           │
├─────────────────────────────────────┤
│   WHY CAN'T I UNDERSTAND?           │
│   [Explanation section...]          │
├─────────────────────────────────────┤
│   HOW IT WORKS                      │
│   1. Listen to patterns             │
│   2. Practice recognition           │
│   3. Train your ear with drills     │
├─────────────────────────────────────┤
│   PRICING                           │
│   Free: Levels 1-2 (50 patterns)    │
│   Premium: All 185 patterns         │
│   $3.99/mo or $29.99/year           │
└─────────────────────────────────────┘
```

#### Dashboard (/dashboard)
```
┌─────────────────────────────────────┐
│  ← Dashboard              [Settings]│
├─────────────────────────────────────┤
│   Good morning, [Name]! 👋          │
│                                     │
│   ┌──────────┐ ┌──────────────────┐ │
│   │ 🔥 12    │ │ 47/185 patterns  │ │
│   │ day      │ │ ████░░░░ 25%     │ │
│   │ streak   │ │                  │ │
│   └──────────┘ └──────────────────┘ │
│                                     │
│   📚 Continue Learning              │
│   ┌─────────────────────────────┐   │
│   │ Level 2: Common Reductions  │   │
│   │ Pattern 23/50               │   │
│   │ [Continue →]                │   │
│   └─────────────────────────────┘   │
│                                     │
│   🔄 Review Due (8 patterns)        │
│   ┌─────────────────────────────┐   │
│   │ Weak forms (3)              │   │
│   │ Reductions (5)              │   │
│   │ [Start Review →]            │   │
│   └─────────────────────────────┘   │
│                                     │
│   📊 Your Progress                  │
│   ┌─────────────────────────────┐   │
│   │ [Progress chart by week]    │   │
│   └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [Dashboard] [Learn] [Review] [Me]  │
└─────────────────────────────────────┘
```

#### Learn Screen (/learn/[levelId])
```
┌─────────────────────────────────────┐
│  ← Level 1                    23/40 │
├─────────────────────────────────────┤
│                                     │
│   The weak form of "to"             │
│                                     │
│   In natural speech, "to" changes   │
│   from /tuː/ to /tə/                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │   "I want to go home"       │   │
│   │                             │   │
│   │   [🐢 Slow]    [🐰 Fast]    │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   When spoken naturally:            │
│   "I wanna go home"                 │
│                                     │
│   💡 Tip: Listen for the schwa      │
│   sound /ə/ - it's the most common  │
│   vowel in spoken English!          │
│                                     │
│                                     │
│        [Got it! Next →]             │
│                                     │
└─────────────────────────────────────┘
```

#### Exercise: Listening Discrimination
```
┌─────────────────────────────────────┐
│  ← Practice                    4/10 │
├─────────────────────────────────────┤
│                                     │
│   What did you hear?                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │         [▶ Play]            │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ ○  "want to"                │   │
│   └─────────────────────────────┘   │
│   ┌─────────────────────────────┐   │
│   │ ○  "wanna"                  │   │
│   └─────────────────────────────┘   │
│   ┌─────────────────────────────┐   │
│   │ ○  "won't"                  │   │
│   └─────────────────────────────┘   │
│                                     │
│                                     │
│         [Check Answer]              │
│                                     │
└─────────────────────────────────────┘
```

#### Exercise: Dictation Challenge
```
┌─────────────────────────────────────┐
│  ← Dictation                   2/5  │
├─────────────────────────────────────┤
│                                     │
│   Type what you hear                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │    [▶ Play]  [🔄 Replay]    │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │  I wanna go to the store_   │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   Plays remaining: 2                │
│                                     │
│                                     │
│         [Submit Answer]             │
│                                     │
└─────────────────────────────────────┘
```

#### Feedback Modal (Correct)
```
┌─────────────────────────────────────┐
│                                     │
│            ✓                        │
│         Correct!                    │
│                                     │
│   "I wanna go to the store"         │
│                                     │
│   The speaker reduced:              │
│   • "want to" → "wanna"             │
│   • "to the" → "tə thə"             │
│                                     │
│         [Continue →]                │
│                                     │
└─────────────────────────────────────┘
```

### 5.4 Audio Player Component Spec

```typescript
interface AudioPlayerProps {
  slowUrl: string;
  fastUrl: string;
  showSpeedControl?: boolean;
  onPlaySlow?: () => void;
  onPlayFast?: () => void;
}

// States: idle, loading, playing, paused
// Preload both audio files on component mount
// Visual feedback: animated waveform or pulsing icon during playback
// Keyboard shortcuts: S for slow, F for fast, Space for replay last
```

---

## 6. Content Specification

### 6.1 Pattern Data Format

```json
{
  "id": "reduction-wanna",
  "category": "reductions",
  "level": 1,
  "title": "Want to → Wanna",
  "description": "In casual speech, 'want to' is almost always pronounced as 'wanna'. This is one of the most common reductions in English.",
  "phoneticClear": "/wɑːnt tuː/",
  "phoneticReduced": "/wɑːnə/",
  "exampleSentence": "I want to go home.",
  "exampleTranscription": "I wanna go home.",
  "audioSlowUrl": "/audio/patterns/reduction-wanna-slow.mp3",
  "audioFastUrl": "/audio/patterns/reduction-wanna-fast.mp3",
  "tips": [
    "Listen for the 't' sound disappearing completely",
    "The 'to' becomes a quick 'uh' sound (schwa)",
    "This reduction happens in questions too: 'Do you wanna...?'"
  ],
  "difficulty": 1,
  "orderIndex": 5
}
```

### 6.2 Exercise Data Format

```json
{
  "id": "disc-wanna-001",
  "patternId": "reduction-wanna",
  "type": "discrimination",
  "audioUrl": "/audio/exercises/disc-wanna-001.mp3",
  "prompt": "What did you hear?",
  "correctAnswer": "wanna",
  "options": ["want to", "wanna", "won't", "wanted"],
  "explanation": "The speaker said 'wanna', which is the reduced form of 'want to'."
}
```

```json
{
  "id": "dict-wanna-001",
  "patternId": "reduction-wanna",
  "type": "dictation",
  "audioUrl": "/audio/exercises/dict-wanna-001.mp3",
  "correctAnswer": "I wanna talk to you about something",
  "acceptableAnswers": [
    "i wanna talk to you about something",
    "I want to talk to you about something",
    "i want to talk to you about something"
  ],
  "highlightPatterns": ["wanna", "to you"]
}
```

### 6.3 Audio Generation Strategy

For MVP, generate audio using:
1. **Edge TTS** (via edge-tts Python package) - Free, good quality
2. **Natural Reader** - Free tier for short clips
3. Record yourself or hire Fiverr voice actors ($5-20 per batch)

Audio specs:
- Format: MP3
- Bitrate: 128kbps
- Sample rate: 44.1kHz
- Duration: 2-8 seconds per clip
- Two versions per pattern: slow (0.7x speed) and natural (1.0x)

Script for batch generation:
```bash
# scripts/generate-audio.ts
# Uses edge-tts to generate audio files from pattern data
# Outputs to public/audio/patterns/
```

---

## 7. Spaced Repetition Implementation

### 7.1 SM-2 Algorithm

```typescript
// lib/utils/spaced-repetition.ts

interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: Date;
}

/**
 * SM-2 Spaced Repetition Algorithm
 * @param quality - User's response quality (0-5)
 *   0: Complete blackout
 *   1: Incorrect, remembered upon seeing answer
 *   2: Incorrect, but easy to recall after seeing answer
 *   3: Correct with serious difficulty
 *   4: Correct with some hesitation
 *   5: Perfect response
 * @param previousEF - Previous ease factor (default 2.5)
 * @param previousInterval - Previous interval in days
 */
export function calculateSM2(
  quality: number,
  previousEF: number = 2.5,
  previousInterval: number = 1
): SM2Result {
  // Calculate new ease factor
  let newEF = previousEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF); // Minimum EF is 1.3

  let newInterval: number;

  if (quality < 3) {
    // Failed - reset interval
    newInterval = 1;
  } else {
    if (previousInterval === 1) {
      newInterval = 1;
    } else if (previousInterval === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEF);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: newEF,
    intervalDays: newInterval,
    nextReviewDate,
  };
}

/**
 * Convert exercise result to SM-2 quality score
 */
export function exerciseResultToQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  averageTimeMs: number = 5000
): number {
  if (!isCorrect) {
    return 1; // Incorrect
  }
  
  if (responseTimeMs < averageTimeMs * 0.5) {
    return 5; // Fast and correct
  } else if (responseTimeMs < averageTimeMs) {
    return 4; // Normal speed, correct
  } else {
    return 3; // Slow but correct
  }
}
```

### 7.2 Review Queue Logic

```typescript
// lib/utils/review-queue.ts

export async function getDuePatterns(userId: string): Promise<UserPatternProgress[]> {
  const { data, error } = await supabase
    .from('user_pattern_progress')
    .select('*, patterns(*)')
    .eq('user_id', userId)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true })
    .limit(20);
    
  return data || [];
}

export async function getNewPatternsForLevel(
  userId: string, 
  level: number,
  limit: number = 5
): Promise<Pattern[]> {
  // Get patterns user hasn't started yet
  const { data: practiced } = await supabase
    .from('user_pattern_progress')
    .select('pattern_id')
    .eq('user_id', userId);
    
  const practicedIds = practiced?.map(p => p.pattern_id) || [];
  
  const { data: patterns } = await supabase
    .from('patterns')
    .select('*')
    .eq('level', level)
    .not('id', 'in', `(${practicedIds.join(',')})`)
    .order('order_index')
    .limit(limit);
    
  return patterns || [];
}
```

---

## 8. Authentication & Authorization

### 8.1 Auth Flow

```typescript
// lib/supabase/auth.ts

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (data.user) {
    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
    });
  }
  
  return { data, error };
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
```

### 8.2 Authorization Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/dashboard', '/learn', '/review', '/practice'];
  const isProtected = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Premium-only routes
  const premiumPaths = ['/learn/3', '/learn/4', '/learn/5', '/learn/6'];
  const isPremiumPath = premiumPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isPremiumPath && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expires_at')
      .eq('id', session.user.id)
      .single();

    const isPremium = profile?.subscription_tier !== 'free' && 
      (!profile?.subscription_expires_at || 
       new Date(profile.subscription_expires_at) > new Date());

    if (!isPremium) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return res;
}
```

---

## 9. Payment Integration

### 9.1 Lemon Squeezy Setup

```typescript
// lib/payments/lemonsqueezy.ts

const LEMON_SQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

interface CheckoutOptions {
  email: string;
  userId: string;
  variantId: string; // Product variant (monthly/yearly/lifetime)
}

export async function createCheckout(options: CheckoutOptions): Promise<string> {
  const response = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: options.email,
            custom: {
              user_id: options.userId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: options.variantId,
            },
          },
        },
      },
    }),
  });

  const data = await response.json();
  return data.data.attributes.url;
}
```

### 9.2 Webhook Handler

```typescript
// app/api/webhook/route.ts

import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('x-signature');
  
  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(body).digest('hex');
  
  if (signature !== digest) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  
  switch (event.meta.event_name) {
    case 'subscription_created':
    case 'subscription_updated':
      await handleSubscriptionUpdate(event.data);
      break;
    case 'subscription_cancelled':
      await handleSubscriptionCancelled(event.data);
      break;
    case 'order_created':
      // Lifetime purchase
      if (event.data.attributes.first_order_item.variant_name === 'Lifetime') {
        await handleLifetimePurchase(event.data);
      }
      break;
  }

  return new Response('OK', { status: 200 });
}

async function handleSubscriptionUpdate(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  const expiresAt = data.attributes.renews_at;
  
  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'premium',
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId);
}
```

### 9.3 Pricing Variants (PPP)

| Region | Monthly | Yearly | Lifetime |
|--------|---------|--------|----------|
| US/EU/AU | $7.99 | $59.99 | $149 |
| Brazil | $2.99 | $24.99 | $49 |
| India | $1.99 | $14.99 | $39 |
| Vietnam/Indonesia | $1.99 | $14.99 | $39 |
| Other | $4.99 | $39.99 | $99 |

---

## 10. PWA Configuration

### 10.1 Manifest

```json
// public/manifest.json
{
  "name": "NativePace - Understand Native English",
  "short_name": "NativePace",
  "description": "Learn to understand fast native English speech",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 10.2 Service Worker Strategy

```typescript
// Cache audio files aggressively for offline practice
// Use Workbox with Next.js

// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.mp3$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

---

## 11. Analytics Events

### 11.1 Key Events to Track

```typescript
// lib/analytics/events.ts

export const ANALYTICS_EVENTS = {
  // Onboarding
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  ONBOARDING_STEP: 'onboarding_step',
  
  // Learning
  PATTERN_VIEWED: 'pattern_viewed',
  PATTERN_AUDIO_PLAYED: 'pattern_audio_played',
  PATTERN_COMPLETED: 'pattern_completed',
  LEVEL_COMPLETED: 'level_completed',
  
  // Exercises
  EXERCISE_STARTED: 'exercise_started',
  EXERCISE_ANSWERED: 'exercise_answered',
  EXERCISE_COMPLETED: 'exercise_completed',
  
  // Engagement
  STREAK_ACHIEVED: 'streak_achieved',
  REVIEW_SESSION_STARTED: 'review_session_started',
  REVIEW_SESSION_COMPLETED: 'review_session_completed',
  
  // Monetization
  PAYWALL_VIEWED: 'paywall_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
};
```

### 11.2 PostHog Integration

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.opt_out_capturing();
        }
      },
    });
  }
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  posthog.identify(userId, traits);
}
```

---

## 12. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure Supabase (database + auth)
- [ ] Create database schema and RLS policies
- [ ] Build basic component library (Button, Card, etc.)
- [ ] Implement landing page
- [ ] Set up auth flows (signup, login, Google OAuth)

### Phase 2: Core Learning (Week 3-4)
- [ ] Create pattern data structure and seed initial patterns (50)
- [ ] Build AudioPlayer component
- [ ] Implement Pattern View screen
- [ ] Build exercise components (comparison, discrimination)
- [ ] Create progress tracking system
- [ ] Implement basic SM-2 spaced repetition

### Phase 3: Exercises & Review (Week 5-6)
- [ ] Build dictation exercise with fuzzy matching
- [ ] Implement speed training exercise
- [ ] Create review queue system
- [ ] Build dashboard with stats
- [ ] Add streak tracking
- [ ] Generate/record audio for 50 patterns

### Phase 4: Polish & Monetization (Week 7-8)
- [ ] Implement premium gating
- [ ] Integrate Lemon Squeezy payments
- [ ] Set up PPP pricing
- [ ] Configure PWA (manifest, service worker)
- [ ] Add PostHog analytics
- [ ] Create pricing page
- [ ] Mobile responsive polish
- [ ] Performance optimization

### Phase 5: Launch Prep (Week 8+)
- [ ] Create remaining pattern content (135 more)
- [ ] SEO optimization
- [ ] Set up error monitoring (Sentry)
- [ ] Write documentation
- [ ] Prepare launch assets
- [ ] Beta test with 10-20 users

---

## 13. Success Metrics

### North Star Metric
**Weekly Active Learners (WAL)** - Users who complete at least one exercise per week

### Key Performance Indicators

| Metric | Target (Month 6) |
|--------|------------------|
| Monthly Active Users | 2,000 |
| Free → Premium Conversion | 3% |
| Monthly Recurring Revenue | $200 |
| Day 7 Retention | 25% |
| Day 30 Retention | 15% |
| Average Session Length | 8 minutes |
| Patterns Mastered per User | 30 |

---

## 14. Out of Scope (v1)

These features are explicitly NOT in MVP:
- AI-powered conversation practice
- Speech recognition / pronunciation scoring
- Social features (leaderboards, friends)
- Native mobile apps (iOS/Android)
- Multiple language interfaces
- Community features
- Gamification beyond streaks
- Video content
- Live tutoring integration

---

## 15. Open Questions

1. **Brand name**: Is "NativePace" available? Alternatives: SoundShift, NativeEar, SpeedListen
2. **Initial content**: Should we launch with 50 patterns (faster) or 100 (more complete)?
3. **Audio**: Generate with TTS or hire voice actors? (TTS faster, actors better quality)
4. **Free tier limit**: Levels 1-2 (50 patterns) enough to demonstrate value?

---

## Appendix A: Initial Pattern List (Level 1)

```
1. want to → wanna
2. going to → gonna
3. have to → hafta
4. got to → gotta
5. kind of → kinda
6. lot of → lotta
7. out of → outta
8. sort of → sorta
9. "to" weak form → /tə/
10. "for" weak form → /fər/
11. "of" weak form → /əv/
12. "and" weak form → /ən/
13. "the" before consonants → /ðə/
14. "a" weak form → /ə/
15. "him" weak form → /ɪm/
16. "her" weak form → /ər/
17. "them" weak form → /əm/
18. "can" weak form → /kən/
19. "was" weak form → /wəz/
20. "were" weak form → /wər/
```

---

## Appendix B: Competitors Reference

| App | Focus | Weakness | Price |
|-----|-------|----------|-------|
| ELSA | Pronunciation | Speaking only, no listening | $12/mo |
| Duolingo | General | Unnatural sentences, no fast speech | Free/$7 |
| Pimsleur | Listening | Expensive, dated | $15/mo |
| Speechling | Pronunciation | No comprehension training | $20/mo |
| Yabla | Real video | Passive, no active training | $13/mo |

**Our differentiation**: First app focused specifically on decoding connected speech patterns with active exercises.

---

*End of Specification*