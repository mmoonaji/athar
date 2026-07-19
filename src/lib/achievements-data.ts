export type AchievementKey =
  | 'FIRST_LESSON'
  | '7_DAY_STREAK'
  | '10_LESSONS'
  | 'COMPLETE_PATH'
  | 'COMPLETE_DOMAIN'

export interface Achievement {
  key: AchievementKey
  label: string
  description: string
  icon: string
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementKey, Achievement> = {
  FIRST_LESSON: {
    key: 'FIRST_LESSON',
    label: 'أول خطوة',
    description: 'أتممت درسك الأول في أثر',
    icon: '🌱',
  },
  '7_DAY_STREAK': {
    key: '7_DAY_STREAK',
    label: 'شعلة التعلم',
    description: 'تعلمت لمدة ٧ أيام متواصلة',
    icon: '🔥',
  },
  '10_LESSONS': {
    key: '10_LESSONS',
    label: 'طالب علم مجتهد',
    description: 'أتممت ١٠ دروس بنجاح',
    icon: '📚',
  },
  COMPLETE_PATH: {
    key: 'COMPLETE_PATH',
    label: 'إتمام مسار',
    description: 'أكملت مساراً تعليمياً كاملاً',
    icon: '🏆',
  },
  COMPLETE_DOMAIN: {
    key: 'COMPLETE_DOMAIN',
    label: 'ختم المجال',
    description: 'أكملت جميع المسارات في مجال علمي',
    icon: '👑',
  },
}
