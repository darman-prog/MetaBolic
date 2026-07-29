import {
  MissionPriority,
  MissionStatus,
  MissionType,
  MuscleGroup,
  ProtocolStatus,
  Rank,
  StimulusType,
} from '../constants/domain.constants';

// ---------------------------------------------------------------------------
// Paginación
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Operator Profile
// ---------------------------------------------------------------------------
export interface OperatorProfileRead {
  id: string;
  alias: string;
  rank: Rank;
  level: number;
  xp_total: number;
  height_cm: number | null;
  current_weight_kg: number | null;
  avatar: string | null;
  username: string;
  email: string;
  created_at: string;
}

export interface OperatorProfileWrite {
  alias?: string;
  height_cm?: number;
  current_weight_kg?: number;
  avatar?: File | string;
}

// ---------------------------------------------------------------------------
// Exercise Module (pertenece a un Protocol via FK)
// ---------------------------------------------------------------------------
export interface ExerciseModuleRead {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  order: number;
  sets: number;
  reps: number;
  target_weight_kg: number;
}

export interface ExerciseModuleWrite {
  name: string;
  muscle_group: MuscleGroup;
  order: number;
  sets: number;
  reps: number;
  target_weight_kg: number;
}

// ---------------------------------------------------------------------------
// Protocol
// ---------------------------------------------------------------------------
export interface ProtocolRead {
  id: string;
  name: string;
  stimulus_type: StimulusType;
  status: ProtocolStatus;
  estimated_duration_min: number;
  metabolic_load_kcal: number | null;
  created_by: string;
  created_by_alias: string;
  modules: ExerciseModuleRead[];
  module_count: number;
  updated_at: string;
}

export interface ProtocolWrite {
  name: string;
  stimulus_type: StimulusType;
  status: ProtocolStatus;
  estimated_duration_min: number;
  metabolic_load_kcal?: number | null;
  modules: ExerciseModuleWrite[];
}

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------
export interface MissionRead {
  id: string;
  title: string;
  description: string;
  priority: MissionPriority;
  mission_type: MissionType;
  xp_reward: number;
  current_progress: number;
  goal: number;
  progress_percent: number;
  status: MissionStatus;
  deadline: string | null;
  operator: string;
  operator_alias: string;
  created_at: string;
  completed_at: string | null;
}

export interface MissionWrite {
  title: string;
  description?: string;
  priority: MissionPriority;
  mission_type: MissionType;
  xp_reward?: number;
  current_progress?: number;
  goal?: number;
  status?: MissionStatus;
  deadline?: string | null;
}

// ---------------------------------------------------------------------------
// Progress Entry
// ---------------------------------------------------------------------------
export interface ProgressEntryRead {
  id: string;
  operator: string;
  operator_alias: string;
  date: string;
  weight_kg: number;
  body_fat_percentage?: number | null;
  measurements?: Record<string, unknown> | null;
}

export interface ProgressEntryWrite {
  date: string;
  weight_kg: number;
  body_fat_percentage?: number | null;
  measurements?: Record<string, unknown> | null;
}

export interface ProgressSummary {
  total_sessions: number;
  total_load_kg: number;
  total_calories: number;
  completed_missions: number;
  current_streak_days: number;
  xp_total: number;
  level: number;
}

export interface MuscleGroupVolumeSummary {
  muscle_group: MuscleGroup;
  total_volume: number;
}

// ---------------------------------------------------------------------------
// Training Session
// ---------------------------------------------------------------------------
export interface TrainingSessionRead {
  id: string;
  operator: string;
  operator_alias: string;
  protocol: string | null;
  protocol_name: string | null;
  date: string;
  actual_duration_min: number;
  total_load_kg: number;
  estimated_calories: number | null;
  notes: string;
}

export interface TrainingSessionWrite {
  protocol?: string | null;
  date: string;
  actual_duration_min: number;
  total_load_kg?: number;
  estimated_calories?: number | null;
  notes?: string;
}
