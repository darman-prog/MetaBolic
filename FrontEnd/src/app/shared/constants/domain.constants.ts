// ---------------------------------------------------------------------------
// Domain constants — valores exactos de los choices del backend Django.
// IMPORTANTE: mantener sin tildes donde el backend lo exige.
// ---------------------------------------------------------------------------

export const STIMULUS_TYPES = [
  'FUERZA_MAX',
  'HIPERTROFIA',
  'RESISTENCIA',
  'POTENCIA',
  'RESISTENCIA_MUSCULAR',
] as const;
export type StimulusType = (typeof STIMULUS_TYPES)[number];

export const PROTOCOL_STATUSES = ['ALPHA', 'STABLE', 'BETA'] as const;
export type ProtocolStatus = (typeof PROTOCOL_STATUSES)[number];

export const MUSCLE_GROUPS = ['PUSH', 'PULL', 'CORE', 'LEGS', 'FULL_BODY'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MISSION_PRIORITIES = ['ALTO', 'MEDIO', 'BAJO'] as const;
export type MissionPriority = (typeof MISSION_PRIORITIES)[number];

export const MISSION_TYPES = ['EJERCICIO', 'HIDRATACION', 'SUENO', 'CUSTOM'] as const;
export type MissionType = (typeof MISSION_TYPES)[number];

export const MISSION_STATUSES = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export const RANKS = ['NOVATO', 'VANGUARD', 'ALPHA', 'ELITE', 'LEGEND'] as const;
export type Rank = (typeof RANKS)[number];

export const DEFAULT_PAGE_SIZE = 20;
