import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { validateLessonJson } from '../src/lib/content-validator'

// 1. Dependency-free env file loader
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
  } catch (err) {
    console.warn('Failed to load .env.local file:', err)
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function slugifyArabic(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // spaces/underscores to hyphens
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '') // keep Arabic, Latin letters, numbers, hyphens
}

/**
 * Main importer executor.
 * Supports importing a single JSON file or scanning content/lessons/ in bulk.
 */
async function run() {
  const argPath = process.argv[2]
  const lessonsDir = path.resolve(process.cwd(), 'content/lessons')
  let filesToImport: string[] = []

  if (argPath) {
    const targetFile = path.resolve(process.cwd(), argPath)
    if (!fs.existsSync(targetFile)) {
      console.error(`Error: File not found at "${targetFile}"`)
      process.exit(1)
    }
    filesToImport = [targetFile]
  } else {
    if (!fs.existsSync(lessonsDir)) {
      console.log(`Lessons directory not found at "${lessonsDir}". Creating it...`)
      fs.mkdirSync(lessonsDir, { recursive: true })
      console.log('Place lesson JSON files in "content/lessons/" and re-run.')
      process.exit(0)
    }

    const files = fs.readdirSync(lessonsDir)
    filesToImport = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(lessonsDir, file))

    if (filesToImport.length === 0) {
      console.log('No lesson JSON files found in "content/lessons/".')
      process.exit(0)
    }
  }

  console.log(`Starting import for ${filesToImport.length} files...`)
  let successCount = 0
  let failCount = 0

  for (const filePath of filesToImport) {
    const filename = path.basename(filePath)
    console.log(`\n----------------------------------------\n[جاري الاستيراد] معالجة الملف: ${filename}`)

    try {
      const fileRaw = fs.readFileSync(filePath, 'utf8')
      const json = JSON.parse(fileRaw)

      // 1. Validate
      const validation = validateLessonJson(json)
      if (!validation.success) {
        console.error(`[فشل التحقق] يحتوي الملف ${filename} على الأخطاء التالية:`)
        validation.errors.forEach((e) => console.error(`  - ${e}`))
        failCount++
        continue
      }

      // 2. Perform DB mutations
      const lessonJson = json as import('../src/types/lesson-json').LessonJson
      const metadata = lessonJson.metadata
      const contentBlocks = lessonJson.contentBlocks
      const quiz = lessonJson.quiz

      console.log(`  - التحقق من النطاق: "${metadata.domain}"`)
      
      // Resolve Domain
      let { data: dbDomain } = await supabase
        .from('domains')
        .select('id')
        .eq('name', metadata.domain)
        .maybeSingle()

      if (!dbDomain) {
        console.log(`  - النطاق غير موجود، جاري إنشاؤه...`)
        const { data: newDomain, error: dErr } = await supabase
          .from('domains')
          .insert({
            name: metadata.domain,
            slug: slugifyArabic(metadata.domain),
            description: `نطاق تعليمي خاص بمادة ${metadata.domain}`,
          })
          .select('id')
          .single()

        if (dErr || !newDomain) {
          throw new Error(`تعذر إنشاء النطاق: ${dErr?.message}`)
        }
        dbDomain = newDomain
      }

      // Resolve Path
      console.log(`  - التحقق من المسار: "${metadata.path}"`)
      let { data: dbPath } = await supabase
        .from('paths')
        .select('id')
        .eq('title', metadata.path)
        .maybeSingle()

      if (!dbPath) {
        console.log(`  - المسار غير موجود، جاري إنشاؤه...`)
        const { data: newPath, error: pErr } = await supabase
          .from('paths')
          .insert({
            domain_id: dbDomain.id,
            title: metadata.path,
            slug: slugifyArabic(metadata.path),
            description: `مسار تعليمي لمادة ${metadata.path}`,
            order_index: 1,
          })
          .select('id')
          .single()

        if (pErr || !newPath) {
          throw new Error(`تعذر إنشاء المسار: ${pErr?.message}`)
        }
        dbPath = newPath
      }

      // Resolve Module
      console.log(`  - التحقق من الوحدة: "${metadata.module}"`)
      let { data: dbModule } = await supabase
        .from('modules')
        .select('id')
        .eq('title', metadata.module)
        .eq('path_id', dbPath.id)
        .maybeSingle()

      if (!dbModule) {
        console.log(`  - الوحدة غير موجودة، جاري إنشائها...`)
        const { data: newModule, error: mErr } = await supabase
          .from('modules')
          .insert({
            path_id: dbPath.id,
            title: metadata.module,
            order_index: 1,
          })
          .select('id')
          .single()

        if (mErr || !newModule) {
          throw new Error(`تعذر إنشاء الوحدة: ${mErr?.message}`)
        }
        dbModule = newModule
      }

      // Upsert Lesson
      console.log(`  - رفع/تحديث الدرس: "${metadata.title}" (معرف: ${metadata.id})`)
      const { error: lErr } = await supabase
        .from('lessons')
        .upsert({
          id: metadata.id,
          module_id: dbModule.id,
          title: metadata.title,
          slug: metadata.slug,
          duration_minutes: metadata.estimatedReadingMinutes,
          content: contentBlocks,
          order_index: metadata.orderIndex,
          published: true,
        })

      if (lErr) {
        throw new Error(`تعذر حفظ الدرس: ${lErr.message}`)
      }

      // Resolve/Upsert Quiz
      console.log('  - معالجة الاختبار...')
      let { data: dbQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', metadata.id)
        .maybeSingle()

      if (!dbQuiz) {
        const { data: newQuiz, error: qErr } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: metadata.id,
          })
          .select('id')
          .single()

        if (qErr || !newQuiz) {
          throw new Error(`تعذر إنشاء الاختبار: ${qErr?.message}`)
        }
        dbQuiz = newQuiz
      }

      // Insert Quiz Questions and Options
      for (const question of quiz.questions) {
        const { error: qstErr } = await supabase
          .from('questions')
          .upsert({
            id: question.id,
            quiz_id: dbQuiz.id,
            text: question.text,
            type: 'MULTIPLE_CHOICE',
          })

        if (qstErr) {
          throw new Error(`تعذر حفظ سؤال الاختبار: ${qstErr.message}`)
        }

        // Clear existing options to write fresh values
        await supabase
          .from('question_options')
          .delete()
          .eq('question_id', question.id)

        // Insert new options
        const optionRows = question.options.map((o) => ({
          id: o.id,
          question_id: question.id,
          text: o.text,
          is_correct: o.isCorrect,
        }))

        const { error: optErr } = await supabase
          .from('question_options')
          .insert(optionRows)

        if (optErr) {
          throw new Error(`تعذر إدخال خيارات السؤال: ${optErr.message}`)
        }
      }

      console.log(`[نجاح] تم استيراد الدرس "${metadata.title}" بنجاح!`)
      successCount++
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'خطأ غير متوقع'
      console.error(`[فشل استيراد] تعذر استيراد الملف ${filename}: ${errMsg}`)
      failCount++
    }
  }

  console.log(`\n========================================`)
  console.log(`اكتملت العملية: نجاح: ${successCount} | فشل: ${failCount}`)
}

run()
