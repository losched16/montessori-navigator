// Start Here — localStorage progress tracking
// Follows the same pattern as montessori_save_tip_dismissed in chat

export interface StartHereProgress {
  featuresExplored: string[]
  day1Completed: string[]
  completedAt: string | null
  dismissedFromNav: boolean
}

const STORAGE_KEY = 'montessori_start_here_progress'

const DEFAULT_PROGRESS: StartHereProgress = {
  featuresExplored: [],
  day1Completed: [],
  completedAt: null,
  dismissedFromNav: false,
}

export function getProgress(): StartHereProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROGRESS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROGRESS, ...parsed }
  } catch {
    return DEFAULT_PROGRESS
  }
}

function saveProgress(progress: StartHereProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markFeatureExplored(featureId: string): void {
  const progress = getProgress()
  if (!progress.featuresExplored.includes(featureId)) {
    progress.featuresExplored = [...progress.featuresExplored, featureId]
    saveProgress(progress)
  }
}

export function markDay1Done(stepId: string): void {
  const progress = getProgress()
  if (!progress.day1Completed.includes(stepId)) {
    progress.day1Completed = [...progress.day1Completed, stepId]
    saveProgress(progress)
  }
}

export function unmarkDay1Done(stepId: string): void {
  const progress = getProgress()
  progress.day1Completed = progress.day1Completed.filter(id => id !== stepId)
  saveProgress(progress)
}

export function markComplete(): void {
  const progress = getProgress()
  progress.completedAt = new Date().toISOString()
  saveProgress(progress)
}

export function dismissFromNav(): void {
  const progress = getProgress()
  progress.dismissedFromNav = true
  saveProgress(progress)
}

export function showInNav(): void {
  const progress = getProgress()
  progress.dismissedFromNav = false
  progress.completedAt = null
  saveProgress(progress)
}

export function getCompletionPct(): number {
  const progress = getProgress()
  const totalItems = 4 + 12 // 4 Day1 actions + 12 features
  const completedItems = progress.day1Completed.length + progress.featuresExplored.length
  return Math.round((completedItems / totalItems) * 100)
}

export function isStartHereHidden(): boolean {
  const progress = getProgress()
  return progress.dismissedFromNav || progress.completedAt !== null
}
