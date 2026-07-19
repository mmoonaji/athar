import Link from 'next/link'
import { BookOpen, Award, Flame } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-lg">
              أ
            </span>
            <span className="text-lg font-bold text-primary-700 tracking-tight">أثَــر</span>
          </div>
          <Link
            href="/learn"
            className="text-sm font-semibold text-primary-700 bg-primary-50 px-4 py-1.5 rounded-full hover:bg-primary-100 transition-all"
          >
            دخول المنصة
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-md mx-auto px-4 pt-12 pb-8 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-50 border border-secondary-200 text-secondary-600 rounded-full text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-secondary-500 fill-current" />
          <span>منهاج تفاعلي متكامل</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-primary-950 leading-snug">
          حوّل معرفتك الإسلامية إلى <span className="text-primary-700">أثرٍ يمتدّ</span> في حياتك
        </h1>
        
        <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
          أثر هو رفيقك التعليمي اليومي لبناء أساس متين من العلوم الشرعية في ٥ دقائق فقط من خلال دروس تفاعلية مبسطة.
        </p>

        <Link
          href="/learn"
          className="w-full bg-primary-700 text-primary-foreground font-bold py-3.5 px-6 rounded-xl hover:bg-primary-800 transition-all text-center shadow-md hover:shadow-lg scale-100 hover:scale-[1.02] transform"
        >
          ابدأ رحلتك مجاناً
        </Link>
      </header>

      {/* How it Works */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-md mx-auto px-4 flex flex-col gap-8">
          <h2 className="text-xl font-bold text-center text-primary-950">كيف يعمل تطبيق أثر؟</h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex gap-4 items-start">
              <span className="h-8 w-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                ١
              </span>
              <div>
                <h3 className="font-bold text-base text-primary-900 mb-1">اختر مساراً تعليمياً ميسراً</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ابدأ بمسارات قصيرة منظمة تغطي العقيدة، الفقه، السيرة، والأخلاق دون تشتت.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="h-8 w-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                ٢
              </span>
              <div>
                <h3 className="font-bold text-base text-primary-900 mb-1">اقرأ بتركيز في ٥ دقائق</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  استمتع بقراءة نصوص منسقة وواضحة غنية بالآيات والأحاديث الموثقة والفوائد المركزة.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="h-8 w-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                ٣
              </span>
              <div>
                <h3 className="font-bold text-base text-primary-900 mb-1">ثبّت معلوماتك بالاختبارات</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  أجب عن أسئلة تفاعلية سريعة بنهاية كل درس لتقييم فهمك ومراجعة النقاط الأساسية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Path Preview */}
      <section className="max-w-md mx-auto px-4 py-12 w-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary-950">المسار التعليمي الأول</h2>
          <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-0.5 rounded-full">
            أساسي
          </span>
        </div>

        <div className="border border-border bg-card p-5 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-primary-700" />
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-muted-foreground">أساسيات الدين</span>
          </div>
          <h3 className="text-lg font-bold text-primary-950 mb-1.5">ما لا يسع المسلم جهله</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            المنهج التأسيسي المتكامل في العقيدة والعبادات والطهارة لتصحيح العبادة وتثبيت الأركان.
          </p>

          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3">
            <span>٥ دروس أساسية</span>
            <span>٣٠ دقيقة إجمالاً</span>
          </div>
        </div>
      </section>

      {/* Value Prop Banner */}
      <section className="bg-primary-950 text-white py-12 px-4 text-center mt-auto">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <Award className="w-8 h-8 text-secondary-400 mb-1" />
          <h2 className="text-lg font-bold">بلمسات تصميمية مريحة وعصرية</h2>
          <p className="text-sm text-primary-200 leading-relaxed max-w-xs">
            تصفح مريح للعين، دعم كامل للقراءة في الوضع الداكن، وترتيب تلقائي متناسق للقراءة باللغة العربية.
          </p>
          <p className="text-xs text-primary-400 mt-4">
            تطبيق أثر © ٢٠٢٦ - رحلة مبسطة لمعرفة تدوم
          </p>
        </div>
      </section>
    </div>
  )
}
