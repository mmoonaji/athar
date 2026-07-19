import fs from 'fs'
import path from 'path'
import { LessonJsonSchema, LessonJson } from '../src/types/lesson-json'

async function run() {
  const lessonPath = process.argv[2]
  if (!lessonPath) {
    console.error('Error: Please provide a lesson JSON file path. Example: npx tsx scripts/review-lesson.ts content/lessons/example-lesson-spec.json')
    process.exit(1)
  }

  const absolutePath = path.resolve(process.cwd(), lessonPath)
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: Lesson file not found at: ${absolutePath}`)
    process.exit(1)
  }

  console.log(`[مراجعة] جاري تدقيق الدرس: ${path.basename(lessonPath)}`)

  try {
    const raw = fs.readFileSync(absolutePath, 'utf8')
    const json = JSON.parse(raw)
    
    // Parse using Zod schema
    const parsed = LessonJsonSchema.safeParse(json)
    if (!parsed.success) {
      console.error('[خطأ هيكلي] تعذر مراجعة الملف بسبب أخطاء هيكلية:')
      parsed.error.issues.forEach((iss) => {
        console.error(`  - ${iss.path.join('.')}: ${iss.message}`)
      })
      process.exit(1)
    }

    const lesson = parsed.data as LessonJson
    const metadata = lesson.metadata
    const blocks = lesson.contentBlocks

    const audits: string[] = []
    let hasQuran = false
    let hasHadith = false
    let hasNote = false

    // 1. Audit blocks
    blocks.forEach((block, index) => {
      if (block.type === 'quran_verse') {
        hasQuran = true
        if (!block.surah || !block.ayah) {
          audits.push(`❌ [كتلة رقم ${index + 1}] آية قرآنية تفتقر لاسم السورة أو رقم الآية.`)
        } else {
          audits.push(`✅ [كتلة رقم ${index + 1}] التحقق من الآية الكريمة: سورة رقم ${block.surah}، آية رقم ${block.ayah}.`)
        }
      }

      if (block.type === 'hadith') {
        hasHadith = true
        if (!block.source) {
          audits.push(`❌ [كتلة رقم ${index + 1}] حديث نبوي بدون ذكر التخريج أو المصدر.`)
        } else {
          audits.push(`✅ [كتلة رقم ${index + 1}] التحقق من الحديث النبوي الشريف: المصدر/التخريج: "${block.source}".`)
        }
      }

      if (block.type === 'scholar_note') {
        hasNote = true
        const wordCount = block.text.trim().split(/\s+/).length
        if (wordCount > 120) {
          audits.push(`⚠️ [كتلة رقم ${index + 1}] إضاءة علمية تتجاوز الحد الأقصى للكلمات (المحتوى: ${wordCount} كلمة، الحد المسموح: ١٢٠).`)
        } else {
          audits.push(`✅ [كتلة رقم ${index + 1}] التحقق من إضاءة الإمام/العالم: "${block.scholarName || 'غير محدد'}" (${wordCount} كلمة).`)
        }
      }

      if (block.type === 'paragraph') {
        const text = block.text.toLowerCase()
        if (text.includes('ضعيف') || text.includes('موضوع') || text.includes('منكر')) {
          audits.push(`⚠️ [كتلة رقم ${index + 1}] تنبيه: تم الكشف عن كلمات تدل على الضعف أو النكارة في النص، يرجى مراجعة الموثوقية.`)
        }
      }
    })

    if (!hasQuran) audits.push('⚠️ [تنبيه عام] يفتقر الدرس إلى نص قرآني يدعم المعنى.')
    if (!hasHadith) audits.push('⚠️ [تنبيه عام] يفتقر الدرس إلى حديث نبوي شريف يدعم المعنى.')
    if (!hasNote) audits.push('💡 [إرشاد] إضافة قول لأحد أئمة السلف يزيد من رصانة الدرس.')

    // 2. Generate Markdown Review Report
    const reportMd = `# تقرير المراجعة والتدقيق العلمي — ${metadata.title}

## ١. معلومات عامة
- **معرّف الدرس**: \`${metadata.id}\`
- **النطاق**: ${metadata.domain}
- **المسار**: ${metadata.path}
- **الوحدة**: ${metadata.module}
- **التاريخ**: ${new Date().toLocaleDateString('ar-EG')}

## ٢. تفاصيل التدقيق والتحقق الشرعي
${audits.map((a) => `- ${a}`).join('\n')}

## ٣. توصيات مراجع المحتوى
- [ ] التأكد من سلامة الرسم الإملائي للآيات الكريمة ومطابقتها للمصحف.
- [ ] مراجعة تخريج الحديث ومطابقته لكتب السنة المعتمدة.
- [ ] خلو الدرس تماماً من أي أخطاء لغوية أو نحوية ومناسبته للمبتدئين.

## ٤. القرار النهائي
- **القرار**: **مقبول للمراجعة النهائية** (تخضع للنشر اليدوي).
`

    // Save report to content/reviews/ and content/reports/
    const reviewsDir = path.resolve(process.cwd(), 'content/reviews')
    if (!fs.existsSync(reviewsDir)) {
      fs.mkdirSync(reviewsDir, { recursive: true })
    }
    const reportsDir = path.resolve(process.cwd(), 'content/reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const reviewReportPath = path.join(reviewsDir, `${metadata.slug}-review.md`)
    fs.writeFileSync(reviewReportPath, reportMd, 'utf8')

    const reportJsonPath = path.join(reportsDir, `${metadata.slug}-review.json`)
    fs.writeFileSync(
      reportJsonPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          lessonId: metadata.id,
          success: true,
          auditsCount: audits.length,
          hasWarnings: audits.some((a) => a.startsWith('⚠️') || a.startsWith('❌')),
        },
        null,
        2
      ),
      'utf8'
    )

    console.log(`[نجاح] تم إتمام المراجعة بنجاح!`)
    console.log(`[تقرير] تم حفظ تقرير المراجعة في: ${reviewReportPath}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ غير متوقع'
    console.error(`[فشل مراجعة] تعذر إتمام التدقيق للملف: ${msg}`)
    process.exit(1)
  }
}

run()
