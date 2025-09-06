/**
 * Enum Definitions
 * Based on data-model.md specifications
 */

export enum EmailStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived',
}

export enum EmailCategory {
  SPECIFICATION = 'specification',
  ISSUE = 'issue',
  MIGRATION_VUP = 'migration_vup',
  OTHER = 'other',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ResolutionOutcome {
  SOLVED = 'solved',
  WORKAROUND = 'workaround',
  NOT_RESOLVED = 'not_resolved',
  DUPLICATE = 'duplicate',
  NO_ACTION = 'no_action',
}