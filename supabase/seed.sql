-- Seed Data for Athar (أثر)

-- 1. Insert Domain
INSERT INTO public.domains (id, name, slug, description)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'أساسيات الدين',
  'basics-of-religion',
  'العلوم الشرعية الأساسية التي لا يسع المسلم جهلها وتعتبر ركيزة الفرد المسلم.'
) ON CONFLICT (name) DO NOTHING;

-- 2. Insert Learning Path
INSERT INTO public.paths (id, domain_id, title, slug, description, order_index)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'ما لا يسع المسلم جهله',
  'essential-muslim-knowledge',
  'منهاج متكامل وميسر يغطي العقيدة والعبادات الأساسية ليكون لبنة في بناء معرفة إسلامية صحيحة.',
  1
) ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Modules
INSERT INTO public.modules (id, path_id, title, order_index)
VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'الإيمان بالله',
  1
),
(
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'العبادات الأساسية',
  2
) ON CONFLICT DO NOTHING;

-- 4. Insert 5 Lessons with content blocks as JSONB arrays
-- Module 1 Lessons
INSERT INTO public.lessons (id, module_id, title, slug, description, duration_minutes, content, order_index, published)
VALUES 
(
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  'معنى الإيمان وأركانه الستة',
  'what-is-iman',
  'التعريف بأساس العقيدة الإسلامية وأركان الإيمان الستة التي يقوم عليها الدين.',
  5,
  $$[
    {
      "type": "heading",
      "level": 2,
      "text": "حقيقة الإيمان في الدين",
      "orderIndex": 0
    },
    {
      "type": "paragraph",
      "text": "الإيمان ليس مجرد كلمة تقال، بل هو حقيقة عميقة تقوم على التصديق الجازم والعمل الصالح. في الاصطلاح الشرعي، يُعرف الإيمان بأنه: اعتقاد بالقلب، وقول باللسان، وعمل بالجوارح والأركان.",
      "orderIndex": 1
    },
    {
      "type": "hadith",
      "text": "«أنْ تُؤْمِنَ باللَّهِ، ومَلائِكَتِهِ، وكُتُبِهِ، ورُسُلِهِ، والْيَومِ الآخِرِ، وتُؤْمِنَ بالقَدَرِ خَيْرِهِ وشَرِّهِ»",
      "source": "صحيح مسلم",
      "orderIndex": 2
    },
    {
      "type": "scholar_note",
      "text": "قال الإمام الشافعي: وكان الإجماع من الصحابة والتابعين من بعدهم ممن أدركناهم يقولون: الإيمان قول وعمل ونية، لا يجزئ واحد من الثلاثة إلا بالآخر.",
      "orderIndex": 3
    },
    {
      "type": "takeaway",
      "text": "الإيمان بالله يزيد بالطاعة والعمل الصالح وينقص بالمعصية والغفلة، لذا يجب تعاهده باستمرار.",
      "orderIndex": 4
    },
    {
      "type": "reflection_question",
      "text": "كيف يمكنك زيادة إيمانك من خلال عملك وتفاعلاتك اليومية؟",
      "orderIndex": 5
    }
  ]$$,
  1,
  true
),
(
  '66666666-6666-6666-6666-666666666666',
  '33333333-3333-3333-3333-333333333333',
  'أقسام التوحيد الثلاثة',
  'three-types-of-tawhid',
  'شرح أقسام التوحيد: الربوبية، الألوهية، والأسماء والصفات لتأصيل إخلاص العبادة لله وحده.',
  6,
  $$[
    {
      "type": "heading",
      "level": 2,
      "text": "أقسام التوحيد وفائدتها",
      "orderIndex": 0
    },
    {
      "type": "paragraph",
      "text": "التوحيد هو إفراد الله سبحانه بما يختص به من الربوبية والألوهية والأسماء والصفات. وقد قسّم العلماء التوحيد استقراءً من نصوص القرآن والسنة إلى ثلاثة أقسام لتسهيل فهم العقيدة وحمايتها.",
      "orderIndex": 1
    },
    {
      "type": "scholar_note",
      "text": "أقسام التوحيد الثلاثة هي: أولاً توحيد الربوبية (إفراد الله بأفعاله كالخلق والرزق)، ثانياً توحيد الألوهية (إفراد الله بأفعال العباد كالصلاة والعبادة)، وثالثاً توحيد الأسماء والصفات (إثبات ما أثبته الله لنفسه دون تمثيل أو تعطيل).",
      "orderIndex": 2
    },
    {
      "type": "quran_verse",
      "surah": 112,
      "ayah": 1,
      "text": "قُلْ هُوَ اللَّهُ أَحَدٌ",
      "translation": "قل -أيها الرسول-: هو الله المتفرد بالألوهية والربوبية والأسماء والصفات، لا يشاركه أحد فيها.",
      "orderIndex": 3
    },
    {
      "type": "takeaway",
      "text": "فهم التوحيد يحرر العقل من الخرافات ويوجه القلب مباشرة نحو الخالق وحده دون وسائط.",
      "orderIndex": 4
    }
  ]$$,
  2,
  true
);

-- Module 2 Lessons
INSERT INTO public.lessons (id, module_id, title, slug, description, duration_minutes, content, order_index, published)
VALUES 
(
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',
  'أهمية الطهارة في الإسلام',
  'importance-of-taharah',
  'شرح الطهارة كشرط أساسي لصحة العبادات وتأثيرها على النظافة الحسية والمعنوية.',
  5,
  $$[
    {
      "type": "heading",
      "level": 2,
      "text": "الطهور شطر الإيمان",
      "orderIndex": 0
    },
    {
      "type": "paragraph",
      "text": "جعل الإسلام الطهارة والنزاهة أساساً للعبادات اليومية، فهي ليست مجرد نظافة بدنية بل عبادة يتقرب بها المسلم لربه وشرط لازم لقبول أهم العبادات وهي الصلاة.",
      "orderIndex": 1
    },
    {
      "type": "hadith",
      "text": "«الطُّهُورُ شَطْرُ الإِيمَانِ»",
      "source": "صحيح مسلم",
      "orderIndex": 2
    },
    {
      "type": "paragraph",
      "text": "تنقسم الطهارة إلى قسمين رئيسيين: الطهارة المعنوية (طهارة القلب من الشرك والمعاصي)، والطهارة الحسيّة (طهارة البدن والثوب والمكان من النجاسات والأحداث).",
      "orderIndex": 3
    },
    {
      "type": "takeaway",
      "text": "كل وضوء يغسل به المسلم أعضاءه تتساقط معه ذنوبه وخطاياه، مما يجعل الطهارة غسيلًا مستمرًا للروح والجسد.",
      "orderIndex": 4
    }
  ]$$,
  1,
  true
),
(
  '88888888-8888-8888-8888-888888888888',
  '44444444-4444-4444-4444-444444444444',
  'صفة الوضوء العملية وأركانه',
  'how-to-wudu',
  'شرح عملي لخطوات الوضوء الصحيحة كما وردت عن النبي صلى الله عليه وسلم والتمييز بين الفروض والسنن.',
  8,
  $$[
    {
      "type": "heading",
      "level": 2,
      "text": "كيفية الوضوء الصحيح",
      "orderIndex": 0
    },
    {
      "type": "paragraph",
      "text": "الوضوء عبادة مخصصة لها أركان أساسية (فروض) لا يصح الوضوء بدونها وسنن مستحبة تزيد الأجر ونقتدي فيها بالنبي صلى الله عليه وسلم.",
      "orderIndex": 1
    },
    {
      "type": "quran_verse",
      "surah": 5,
      "ayah": 6,
      "text": "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُؤُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ",
      "translation": "يا أيها الذين صدقوا الله ورسوله، إذا أردتم الصلاة فافعلوا ما يلي: اغسلوا وجوهكم، واغسلوا أيديكم مع المرافق، وامسحوا برؤوسكم، واغسلوا أرجلكم مع الكعبين.",
      "orderIndex": 2
    },
    {
      "type": "scholar_note",
      "text": "فروض الوضوء الستة هي: النية وغسل الوجه (ومنه المضمضة والاستنشاق)، غسل اليدين للمرفقين، مسح الرأس، غسل الرجلين للكعبين، والترتيب والموالاة.",
      "orderIndex": 3
    },
    {
      "type": "takeaway",
      "text": "احرص على أداء الوضوء بهدوء وطمأنينة مستشعرًا الامتثال لأمر الله تبارك وتعالى.",
      "orderIndex": 4
    }
  ]$$,
  2,
  true
),
(
  '99999999-9999-9999-9999-999999999999',
  '44444444-4444-4444-4444-444444444444',
  'أركان الصلاة وشروط صحتها',
  'pillars-of-prayer',
  'بيان الفرق بين شروط الصلاة وأركانها وواجباتها لضمان صحة أداء عمود الدين.',
  7,
  $$[
    {
      "type": "heading",
      "level": 2,
      "text": "الفرق بين الشرط والركن",
      "orderIndex": 0
    },
    {
      "type": "paragraph",
      "text": "لصحة الصلاة ثلاثة مستويات من الضوابط: شروط (تسبق الصلاة كالطهارة والقبلة)، أركان (داخل الصلاة لا تسقط عمدًا ولا سهوًا كالركوع والسجود)، وواجبات (تجبر بسجود السهو).",
      "orderIndex": 1
    },
    {
      "type": "scholar_note",
      "text": "شروط الصلاة تسعة منها: الإسلام، العقل، التمييز، رفع الحدث، دخول الوقت، ستر العورة، واجتناب النجاسة، واستقبال القبلة، والنية.",
      "orderIndex": 2
    },
    {
      "type": "takeaway",
      "text": "الصلاة هي الصلة المباشرة بينك وبين الله عز وجل، فالخشوع فيها وحفظ أركانها هما روح العبادة.",
      "orderIndex": 3
    }
  ]$$,
  3,
  true
) ON CONFLICT DO NOTHING;

-- 5. Set up Quizzes for the lessons
INSERT INTO public.quizzes (id, lesson_id)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777')
ON CONFLICT DO NOTHING;

-- 6. Insert Questions
INSERT INTO public.questions (id, quiz_id, text, type)
VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd', 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
  'ما هو تعريف الإيمان في الاصطلاح الشرعي؟', 
  'MULTIPLE_CHOICE'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
  'أي من أقسام التوحيد يتعلق بإخلاص أفعال العباد كالدعاء والصلاة لله وحده؟', 
  'MULTIPLE_CHOICE'
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff', 
  'cccccccc-cccc-cccc-cccc-cccccccccccc', 
  'تنقسم الطهارة إلى طهارة معنوية وطهارة حسية. صح أم خطأ؟', 
  'TRUE_FALSE'
) ON CONFLICT DO NOTHING;

-- 7. Insert Options
INSERT INTO public.question_options (id, question_id, text, is_correct)
VALUES
-- Question 1 Options
('11111111-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'مجرد النطق بالشهادتين باللسان دون عمل', false),
('22222222-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'اعتقاد بالقلب، وقول باللسان، وعمل بالجوارح والأركان', true),
('33333333-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'المعرفة الذهنية بوجود الخالق فقط', false),

-- Question 2 Options
('44444444-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'توحيد الربوبية', false),
('55555555-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'توحيد الألوهية', true),
('66666666-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'توحيد الأسماء والصفات', false),

-- Question 3 Options
('77777777-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'صح', true),
('88888888-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'خطأ', false)
ON CONFLICT DO NOTHING;
