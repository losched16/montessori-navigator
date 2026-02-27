import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAgePlane(dateOfBirth: string | Date | null): string {
  if (!dateOfBirth) return 'unknown'
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const ageYears = ageMonths / 12

  if (ageYears < 3) return '0-3'
  if (ageYears < 6) return '3-6'
  if (ageYears < 9) return '6-9'
  if (ageYears < 12) return '9-12'
  return '12+'
}

export function getAgePlaneLabel(plane: string): string {
  const labels: Record<string, string> = {
    '0-3': 'Infant/Toddler (0–3)',
    '3-6': 'Early Childhood (3–6)',
    '6-9': 'Lower Elementary (6–9)',
    '9-12': 'Upper Elementary (9–12)',
    '12+': 'Adolescent (12+)',
    'unknown': 'Age not set',
  }
  return labels[plane] || plane
}

export function getDevelopmentLevelLabel(level: number | null | undefined): string {
  if (!level) return 'Not assessed'
  const labels = ['', 'Emerging', 'Developing', 'Practicing', 'Proficient', 'Mastered']
  return labels[level] || 'Not assessed'
}

export function getCurriculumAreaLabel(area: string): string {
  const labels: Record<string, string> = {
    practical_life: 'Practical Life',
    sensorial: 'Sensorial',
    language: 'Language',
    mathematics: 'Mathematics',
    cultural_studies: 'Cultural Studies',
    social_emotional: 'Social-Emotional',
    executive_function: 'Executive Function',
    gross_motor: 'Gross Motor',
    fine_motor: 'Fine Motor',
    art_music: 'Art & Music',
    general: 'General',
  }
  return labels[area] || area
}

export function getObservationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    home_activity: 'Home Activity',
    school_observation: 'School Observation',
    milestone_reached: 'Milestone Reached',
    challenge_noted: 'Challenge Noted',
    interest_spark: 'Interest Spark',
    conference_notes: 'Conference Notes',
    general: 'General Note',
  }
  return labels[type] || type
}

export function formatAge(dateOfBirth: string | Date | null): string {
  if (!dateOfBirth) return 'Age unknown'
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months

  if (totalMonths < 24) return `${totalMonths} months`
  if (months < 0) return `${years - 1} years`
  return `${years} years`
}
