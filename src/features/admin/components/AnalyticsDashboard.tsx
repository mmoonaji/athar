import { AnalyticsData } from '../services/analytics-queries'
import { Users, BookOpen, Trophy, TrendingUp, Target, BarChart2 } from 'lucide-react'

interface Props {
  data: AnalyticsData
}

function StatCard({
  label,
  value,
  subLabel,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900">{value}</p>
          {subLabel && <p className="text-[11px] text-slate-400 mt-0.5">{subLabel}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

/** Pure SVG bar chart — no external dependencies */
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
        لا توجد بيانات حتى الآن
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)
  const chartH = 80
  const barW = Math.max(8, Math.floor(360 / data.length) - 4)

  return (
    <svg
      viewBox={`0 0 ${data.length * (barW + 4)} ${chartH + 20}`}
      className="w-full"
      aria-label="نشاط المتعلمين اليومي"
    >
      {data.map((item, i) => {
        const barH = Math.max(4, Math.round((item.count / max) * chartH))
        const x = i * (barW + 4)
        const y = chartH - barH
        return (
          <g key={item.date}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill="#1a4e8f" opacity={0.8} />
            <title>{`${item.date}: ${item.count} متعلم`}</title>
          </g>
        )
      })}
    </svg>
  )
}

export function AnalyticsDashboard({ data }: Props) {
  const { users, learning, topLessons, dailyActive } = data

  return (
    <div className="space-y-8">

      {/* Users Section */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">المستخدمون</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="إجمالي المستخدمين"
            value={users.totalUsers.toLocaleString('ar-EG')}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="مستخدمون جدد (٧ أيام)"
            value={users.newUsersThisWeek.toLocaleString('ar-EG')}
            icon={TrendingUp}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="المشرفون"
            value={users.adminCount.toLocaleString('ar-EG')}
            icon={Target}
            color="bg-violet-50 text-violet-600"
          />
        </div>
      </section>

      {/* Learning Section */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">التعلم</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="دروس بُدئت"
            value={learning.lessonsStarted.toLocaleString('ar-EG')}
            icon={BookOpen}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="دروس مكتملة"
            value={learning.lessonsCompleted.toLocaleString('ar-EG')}
            icon={Trophy}
            color="bg-teal-50 text-teal-600"
          />
          <StatCard
            label="متوسط درجة الاختبار"
            value={learning.averageQuizScore > 0 ? `${learning.averageQuizScore}%` : '—'}
            subLabel={learning.averageQuizScore === 0 ? 'لا توجد اختبارات مكتملة بعد' : undefined}
            icon={BarChart2}
            color="bg-rose-50 text-rose-600"
          />
        </div>
      </section>

      {/* Daily Active Learners Chart */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">المتعلمون النشطون يومياً (آخر ١٤ يوم)</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <MiniBarChart data={dailyActive} />
        </div>
      </section>

      {/* Top Lessons */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">أكثر الدروس اكتمالاً</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {topLessons.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              لم يُكمل أي مستخدم درساً بعد
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-5">#</th>
                  <th className="py-3 px-5">الدرس</th>
                  <th className="py-3 px-5 text-left">عدد الإتمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topLessons.map((lesson, i) => (
                  <tr key={lesson.lessonId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-5 text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-3 px-5 font-medium text-slate-800">{lesson.title}</td>
                    <td className="py-3 px-5 text-left">
                      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {lesson.completionCount.toLocaleString('ar-EG')} إتمام
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  )
}
