import { getUserAchievements } from '@/actions/achievements'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements-data'

export async function AchievementBadges() {
  const achievements = await getUserAchievements()

  if (achievements.length === 0) return null

  return (
    <section className="bg-card border border-border p-4 rounded-2xl shadow-sm">
      <h3 className="text-xs font-bold text-muted-foreground mb-3">الإنجازات المفتوحة 🏅</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => (
          <div
            key={a.key}
            className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-full px-3 py-1.5"
            title={a.description}
          >
            <span className="text-base">{a.icon}</span>
            <span className="text-xs font-bold text-primary-800">{a.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// Required for async component in RSC
export { ACHIEVEMENT_DEFINITIONS }
