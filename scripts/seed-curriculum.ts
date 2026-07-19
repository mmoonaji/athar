import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { LessonSpecSchema } from '../src/types/lesson-spec'

// 1. Load env variables from .env.local
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
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 2. Arabic-safe slug generation
function slugifyArabic(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
}

// 3. Zod validation schemas for structure.json
const CurriculumStructureSchema = z.object({
  domains: z.array(
    z.object({
      name: z.string().min(2),
      description: z.string().min(5),
      paths: z.array(
        z.object({
          title: z.string().min(2),
          description: z.string().min(5),
          order_index: z.number().int().min(1),
          modules: z.array(
            z.object({
              title: z.string().min(2),
              order_index: z.number().int().min(1),
            })
          ),
        })
      ),
    })
  ),
})

async function seed() {
  console.log('🚀 Starting Curriculum Seeding...')

  // Step A: Seed Domain/Path/Module Structure
  const structurePath = path.resolve(process.cwd(), 'content/curriculum/structure.json')
  if (!fs.existsSync(structurePath)) {
    console.error(`Error: Structure file not found at ${structurePath}`)
    process.exit(1)
  }

  const rawStructure = fs.readFileSync(structurePath, 'utf8')
  const parseResult = CurriculumStructureSchema.safeParse(JSON.parse(rawStructure))
  
  if (!parseResult.success) {
    console.error('❌ structure.json failed validation:', parseResult.error.format())
    process.exit(1)
  }

  const data = parseResult.data

  for (const domain of data.domains) {
    console.log(`- Seeding domain: ${domain.name}`)
    const domainSlug = slugifyArabic(domain.name)
    
    // Idempotent Domain Upsert
    const { data: dbDomain, error: dErr } = await supabase
      .from('domains')
      .upsert(
        { name: domain.name, slug: domainSlug, description: domain.description },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (dErr || !dbDomain) {
      console.error(`❌ Domain seeding failed:`, dErr?.message)
      continue
    }

    for (const p of domain.paths) {
      console.log(`  - Seeding path: ${p.title}`)
      const pathSlug = slugifyArabic(p.title)

      // Idempotent Path Upsert
      const { data: dbPath, error: pErr } = await supabase
        .from('paths')
        .upsert(
          {
            domain_id: dbDomain.id,
            title: p.title,
            slug: pathSlug,
            description: p.description,
            order_index: p.order_index,
          },
          { onConflict: 'slug' }
        )
        .select('id')
        .single()

      if (pErr || !dbPath) {
        console.error(`❌ Path seeding failed:`, pErr?.message)
        continue
      }

      for (const m of p.modules) {
        console.log(`    - Seeding module: ${m.title}`)

        // Idempotent Module Upsert (check exists by path_id and title to avoid duplicates)
        const { data: existingModule } = await supabase
          .from('modules')
          .select('id')
          .eq('path_id', dbPath.id)
          .eq('title', m.title)
          .maybeSingle()

        let moduleId: string

        if (existingModule) {
          const { error: mErr } = await supabase
            .from('modules')
            .update({ order_index: m.order_index })
            .eq('id', existingModule.id)
          if (mErr) console.error(`❌ Module update failed:`, mErr.message)
          moduleId = existingModule.id
        } else {
          const { data: newModule, error: mErr } = await supabase
            .from('modules')
            .insert({
              path_id: dbPath.id,
              title: m.title,
              order_index: m.order_index,
            })
            .select('id')
            .single()
          if (mErr || !newModule) {
            console.error(`❌ Module insert failed:`, mErr?.message)
            continue
          }
          moduleId = newModule.id
        }

        // Step B: Seed Lesson Specifications belonging to this module
        const specsDir = path.resolve(process.cwd(), 'content/specifications/level1/aqeedah')
        if (fs.existsSync(specsDir)) {
          const specFiles = fs.readdirSync(specsDir).filter((file) => file.endsWith('.json'))

          for (const file of specFiles) {
            const specFilePath = path.join(specsDir, file)
            const rawSpec = fs.readFileSync(specFilePath, 'utf8')
            const parsedSpec = JSON.parse(rawSpec)
            const specResult = LessonSpecSchema.safeParse(parsedSpec)

            if (!specResult.success) {
              console.warn(`⚠️ Lesson spec validation failed for ${file}:`, specResult.error.format())
              continue
            }

            const spec = specResult.data

            // Verify if this spec belongs to the current module
            if (spec.module === m.title) {
              console.log(`      - Seeding lesson spec: ${spec.title}`)
              
              // Idempotent Lesson Upsert
              const { error: lErr } = await supabase
                .from('lessons')
                .upsert(
                  {
                    id: spec.id,
                    module_id: moduleId,
                    title: spec.title,
                    slug: spec.slug,
                    description: spec.summary,
                    duration_minutes: spec.estimatedReadingMinutes,
                    content: [], // Spec has empty content blocks initially
                    order_index: spec.order,
                    published: false, // Spec is not published yet
                  },
                  { onConflict: 'slug' }
                )

              if (lErr) {
                console.error(`❌ Lesson spec insert failed for ${spec.title}:`, lErr.message)
              }
            }
          }
        }
      }
    }
  }

  console.log('✅ Curriculum Seeding Completed successfully!')
}

seed().catch((err) => {
  console.error('❌ Seeding process encountered unhandled error:', err)
  process.exit(1)
})
