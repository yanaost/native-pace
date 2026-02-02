export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Pattern category type matching database CHECK constraint
export type PatternCategory =
  | 'weak-forms'
  | 'reductions'
  | 'linking'
  | 'elision'
  | 'assimilation'
  | 'flapping';

// Exercise type matching database CHECK constraint
export type ExerciseType = 'comparison' | 'discrimination' | 'dictation' | 'speed';

export type Database = {
  public: {
    Tables: {
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          pattern_id: string | null;
          exercise_type: ExerciseType;
          is_correct: boolean;
          response_time_ms: number | null;
          user_input: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pattern_id?: string | null;
          exercise_type: ExerciseType;
          is_correct: boolean;
          response_time_ms?: number | null;
          user_input?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pattern_id?: string | null;
          exercise_type?: ExerciseType;
          is_correct?: boolean;
          response_time_ms?: number | null;
          user_input?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exercise_attempts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exercise_attempts_pattern_id_fkey';
            columns: ['pattern_id'];
            isOneToOne: false;
            referencedRelation: 'patterns';
            referencedColumns: ['id'];
          }
        ];
      };
      user_pattern_progress: {
        Row: {
          id: string;
          user_id: string;
          pattern_id: string;
          mastery_score: number;
          times_practiced: number;
          times_correct: number;
          last_practiced_at: string | null;
          next_review_at: string | null;
          ease_factor: number;
          interval_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pattern_id: string;
          mastery_score?: number;
          times_practiced?: number;
          times_correct?: number;
          last_practiced_at?: string | null;
          next_review_at?: string | null;
          ease_factor?: number;
          interval_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pattern_id?: string;
          mastery_score?: number;
          times_practiced?: number;
          times_correct?: number;
          last_practiced_at?: string | null;
          next_review_at?: string | null;
          ease_factor?: number;
          interval_days?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_pattern_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_pattern_progress_pattern_id_fkey';
            columns: ['pattern_id'];
            isOneToOne: false;
            referencedRelation: 'patterns';
            referencedColumns: ['id'];
          }
        ];
      };
      patterns: {
        Row: {
          id: string;
          category: PatternCategory;
          level: number;
          title: string;
          description: string;
          phonetic_clear: string | null;
          phonetic_reduced: string | null;
          example_sentence: string | null;
          example_transcription: string | null;
          audio_slow_url: string | null;
          audio_fast_url: string | null;
          tips: string[];
          difficulty: number;
          order_index: number;
        };
        Insert: {
          id: string;
          category: PatternCategory;
          level: number;
          title: string;
          description: string;
          phonetic_clear?: string | null;
          phonetic_reduced?: string | null;
          example_sentence?: string | null;
          example_transcription?: string | null;
          audio_slow_url?: string | null;
          audio_fast_url?: string | null;
          tips?: string[];
          difficulty?: number;
          order_index: number;
        };
        Update: {
          id?: string;
          category?: PatternCategory;
          level?: number;
          title?: string;
          description?: string;
          phonetic_clear?: string | null;
          phonetic_reduced?: string | null;
          example_sentence?: string | null;
          example_transcription?: string | null;
          audio_slow_url?: string | null;
          audio_fast_url?: string | null;
          tips?: string[];
          difficulty?: number;
          order_index?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          native_language: string | null;
          subscription_tier: 'free' | 'premium' | 'lifetime';
          subscription_expires_at: string | null;
          streak_current: number;
          streak_longest: number;
          last_practice_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          native_language?: string | null;
          subscription_tier?: 'free' | 'premium' | 'lifetime';
          subscription_expires_at?: string | null;
          streak_current?: number;
          streak_longest?: number;
          last_practice_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          native_language?: string | null;
          subscription_tier?: 'free' | 'premium' | 'lifetime';
          subscription_expires_at?: string | null;
          streak_current?: number;
          streak_longest?: number;
          last_practice_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      handle_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Pattern = Database['public']['Tables']['patterns']['Row'];
export type PatternInsert = Database['public']['Tables']['patterns']['Insert'];
export type PatternUpdate = Database['public']['Tables']['patterns']['Update'];

export type UserPatternProgress =
  Database['public']['Tables']['user_pattern_progress']['Row'];
export type UserPatternProgressInsert =
  Database['public']['Tables']['user_pattern_progress']['Insert'];
export type UserPatternProgressUpdate =
  Database['public']['Tables']['user_pattern_progress']['Update'];

export type ExerciseAttempt =
  Database['public']['Tables']['exercise_attempts']['Row'];
export type ExerciseAttemptInsert =
  Database['public']['Tables']['exercise_attempts']['Insert'];
export type ExerciseAttemptUpdate =
  Database['public']['Tables']['exercise_attempts']['Update'];
