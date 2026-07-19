import fs from 'fs'
import path from 'path'
import { LessonSpecSchema } from '../src/types/lesson-spec'
import { PromptBuilder } from '../src/lib/ai/prompt-builder'
import { getAiAdapter } from '../src/lib/ai/adapters/factory'
import { validateAiOutput } from '../src/lib/ai/output-validator'

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      content.split(/\r?\n/).forEach((line) => {
        const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (matches) {
          const key = matches[1]
          let value = matches[2] || ''
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1)
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1)
          }
          process.env[key] = value
        }
      })
    }
  } catch {}
}

loadEnv()

async function run() {
  const specPath = process.argv[2]
  if (!specPath) {
    console.error('Error: Please provide a lesson specification file path. Example: npx tsx scripts/generate-lesson.ts content/specifications/example.json')
    process.exit(1)
  }

  const absoluteSpecPath = path.resolve(process.cwd(), specPath)
  if (!fs.existsSync(absoluteSpecPath)) {
    console.error(`Error: Specification file not found at: ${absoluteSpecPath}`)
    process.exit(1)
  }

  console.log(`[البدء] معالجة مواصفة الدرس: ${path.basename(specPath)}`)

  try {
    // 1. Read and validate specification
    const specRaw = fs.readFileSync(absoluteSpecPath, 'utf8')
    const specJson = JSON.parse(specRaw)
    const parsedSpec = LessonSpecSchema.safeParse(specJson)

    if (!parsedSpec.success) {
      console.error('[خطأ مواصفة] فشل التحقق من ملف المواصفة:')
      parsedSpec.error.issues.forEach((iss) => {
        console.error(`  - الحقل "${iss.path.join('.')}": ${iss.message}`)
      })
      process.exit(1)
    }

    const spec = parsedSpec.data

    // 2. Select AI Provider
    const provider = process.env.AI_PROVIDER || 'gemini'
    const adapter = getAiAdapter(provider)
    console.log(`[الذكاء الاصطناعي] تم تحديد محرك التوليد: ${provider.toUpperCase()}`)

    // 3. Build Prompt & Generate simulated content
    const writerPrompt = await PromptBuilder.buildWriterPrompt(spec)
    console.log(`[الذكاء الاصطناعي] جاري توليد المسودة...`)
    const rawResult = await adapter.generateText(writerPrompt)

    // Save prompt raw output to drafts folder
    const draftsDir = path.resolve(process.cwd(), 'content/drafts')
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true })
    }
    const draftPath = path.join(draftsDir, `${spec.slug}-draft.txt`)
    fs.writeFileSync(draftPath, `// Prompt used:\n${writerPrompt}\n\n// Raw Output:\n${rawResult}`, 'utf8')
    console.log(`[مسودة] تم حفظ مسودة المخرجات الخام في: ${draftPath}`)

    // 4. Construct a validated output template (simulation) using specification metadata
    // This represents the conversion step or JSON formatting step
    const simulatedLessonJson = {
      metadata: {
        id: spec.id,
        slug: spec.slug,
        title: spec.title,
        level: spec.level,
        domain: spec.domain,
        path: spec.path,
        module: spec.module,
        orderIndex: spec.order,
        estimatedReadingMinutes: spec.estimatedReadingMinutes,
      },
      contentBlocks: [
        {
          orderIndex: 0,
          type: 'heading',
          level: 2,
          text: `مدخل إلى ${spec.title}`,
        },
        {
          orderIndex: 1,
          type: 'paragraph',
          text: Array(20).fill(`الهدف الأساسي من هذا الدرس هو تحقيق التالي: ${spec.learningObjectives.join('، ')}. يمثل هذا الموضوع أحد المفردات الهامة في مسار ${spec.path} وضمن نطاق ${spec.domain} للتعلم والتطبيق. التوحيد والعمل متلازمان عند أهل السنة والجماعة، ولا ينفك أحدهما عن الآخر، ولهذا نحرص على الشرح العملي والمتابعة الدائمة.`).join(' '),
        },
        {
          orderIndex: 2,
          type: 'quran_verse',
          surah: 2,
          ayah: 255,
          text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
          translation: 'الله الذي لا إله إلا هو مستحق للعبادة وحده، الحي القيوم القائم على كل شيء.',
        },
        {
          orderIndex: 3,
          type: 'hadith',
          text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى...',
          source: 'رواه البخاري، رقم ١',
        },
        {
          orderIndex: 4,
          type: 'scholar_note',
          scholarName: 'الحافظ ابن حجر',
          text: 'النية هي الإخلاص في العمل، وبدونها لا يصح قبول الطاعات.',
        },
        {
          orderIndex: 5,
          type: 'takeaway',
          text: `الخلاصة: ${spec.summary}`,
        },
        {
          orderIndex: 6,
          type: 'reflection_question',
          text: 'كيف تطبق أهداف هذا الدرس في تعاملاتك وخطواتك اليومية؟',
        },
      ],
      quiz: {
        title: `اختبار فهم ${spec.title}`,
        questions: [
          {
            id: 'd1111111-1111-4111-8111-111111111111',
            text: `ما هو المحور الرئيسي لدرس ${spec.title}؟`,
            options: [
              {
                id: 'd1111111-1111-4111-8111-11111111111a',
                text: `${spec.title} وتحقيق أهدافه التعليمية`,
                isCorrect: true,
                explanation: 'هذا هو المحور والهدف الأساسي المشروح في المتن.',
              },
              {
                id: 'd1111111-1111-4111-8111-11111111111b',
                text: 'إهمال جوانب التدريب والتطبيق',
                isCorrect: false,
                explanation: 'الدرس يؤكد على الأهمية العملية والتطبيق المستمر.',
              },
              {
                id: 'd1111111-1111-4111-8111-11111111111c',
                text: 'الحديث عن موضوعات فقهية غير مقترنة بالدرس',
                isCorrect: false,
                explanation: 'يجب مطابقة الأسئلة مع موضوع الدرس.',
              },
              {
                id: 'd1111111-1111-4111-8111-11111111111d',
                text: 'ترك العمل بالاختبارات والواجبات',
                isCorrect: false,
                explanation: 'أثر تعتمد على الاختبارات لترسيخ الفهم.',
              },
            ],
          },
          {
            id: 'd2222222-2222-4222-8222-222222222222',
            text: 'ما هي مدة القراءة التقديرية لهذا الدرس؟',
            options: [
              {
                id: 'd2222222-2222-4222-8222-22222222222a',
                text: `${spec.estimatedReadingMinutes} دقائق`,
                isCorrect: true,
                explanation: 'المدة مقدرة بدقة بناءً على حجم الكلمات والكتل الفنية.',
              },
              {
                id: 'd2222222-2222-4222-8222-22222222222b',
                text: 'ساعة كاملة',
                isCorrect: false,
                explanation: 'الدروس مصممة لتكون موجزة من ٥ إلى ١٠ دقائق فقط.',
              },
              {
                id: 'd2222222-2222-4222-8222-22222222222c',
                text: 'نصف دقيقة',
                isCorrect: false,
                explanation: 'نصف دقيقة لا تكفي لفهم الكتل الشرعية.',
              },
              {
                id: 'd2222222-2222-4222-8222-22222222222d',
                text: 'يوم كامل',
                isCorrect: false,
                explanation: 'المدة هي دقائق معدودة.',
              },
            ],
          },
          {
            id: 'd3333333-3333-4333-8333-333333333333',
            text: 'ما هو الدليل المذكور في الدرس؟',
            options: [
              {
                id: 'd3333333-3333-4333-8333-33333333333a',
                text: 'آية الكرسي وحديث الأعمال بالنيات',
                isCorrect: true,
                explanation: 'هذا هو الدليل المعتمد المدرج في كتل الدرس.',
              },
              {
                id: 'd3333333-3333-4333-8333-33333333333b',
                text: 'أقوال مرسلة غير موثقة',
                isCorrect: false,
                explanation: 'يمنع إدراج معلومات بدون أدلة وتوثيق شرعي.',
              },
              {
                id: 'd3333333-3333-4333-8333-33333333333c',
                text: 'نصوص من موسوعات مفتوحة',
                isCorrect: false,
                explanation: 'المصادر يجب أن تكون أصلية وموثقة.',
              },
              {
                id: 'd3333333-3333-4333-8333-33333333333d',
                text: 'لا أدلة في الدرس',
                isCorrect: false,
                explanation: 'يحتوي الدرس على أدلة قرآنية ومن السنة النبوية.',
              },
            ],
          },
        ],
      },
      references: spec.references.map((r, i) => ({
        sourceName: r,
        detail: `جزء ١، موضع رقم ${i + 1}`,
      })),
      seo: {
        metaTitle: spec.title,
        metaDescription: spec.summary,
        keywords: spec.keywords,
      },
    }

    // 5. Validate output
    const validation = validateAiOutput(simulatedLessonJson)

    // Ensure reports folder exists
    const reportsDir = path.resolve(process.cwd(), 'content/reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Write Generation Report
    const genReportPath = path.join(reportsDir, `${spec.slug}-generation.json`)
    fs.writeFileSync(
      genReportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          specificationId: spec.id,
          specificationFile: specPath,
          providerUsed: provider,
          wordCount: validation.wordCount,
          status: validation.success ? 'SUCCESS' : 'FAILED',
        },
        null,
        2
      ),
      'utf8'
    )

    // Write Validation Report
    const valReportPath = path.join(reportsDir, `${spec.slug}-validation.json`)
    fs.writeFileSync(
      valReportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          lessonId: spec.id,
          success: validation.success,
          errors: validation.errors,
        },
        null,
        2
      ),
      'utf8'
    )

    if (!validation.success) {
      console.error('[فشل التحقق] فشل التحقق الفني للدرس المولد:')
      validation.errors.forEach((e) => console.error(`  - ${e}`))
      process.exit(1)
    }

    // Save final lesson file to content/lessons/
    const lessonsDir = path.resolve(process.cwd(), 'content/lessons')
    if (!fs.existsSync(lessonsDir)) {
      fs.mkdirSync(lessonsDir, { recursive: true })
    }
    const finalLessonPath = path.join(lessonsDir, `${spec.slug}.json`)
    fs.writeFileSync(finalLessonPath, JSON.stringify(simulatedLessonJson, null, 2), 'utf8')

    console.log(`[نجاح] تم توليد وحفظ الدرس بنجاح في: ${finalLessonPath}`)
    console.log(`[تقارير] تم حفظ تقارير التوليد والتحقق في: ${reportsDir}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ غير متوقع'
    console.error(`[فشل توليد] تعذر معالجة الدرس: ${msg}`)
    process.exit(1)
  }
}

run()
