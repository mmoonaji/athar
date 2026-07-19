# نظام تحويل المحتوى إلى هيكل JSON المعتمد (Athar JSON Converter Prompt)

مهمتك هي أخذ محتوى الدرس المعتمد والمدقق، مع أسئلة الاختبار المصاغة، وتحويلها بالكامل إلى هيكل JSON مطابق تماماً لمخطط التحقق الفني لمنصة أثر (Athar Lesson JSON Schema).

---

## المخطط والخصائص الفنية المطلوبة:

يجب أن يكون الناتج عبارة عن كائن JSON صالح وخالٍ من الأخطاء الهيكلية، ويحتوي على الحقول التالية:

```json
{
  "metadata": {
    "id": "معرف UUID v4 للدرس",
    "slug": "رابط بديل بأحرف صغيرة وأرقام وواصلات فقط",
    "title": "عنوان الدرس",
    "level": "مستوى الدرس من 1 إلى 4",
    "domain": "نطاق الدرس",
    "path": "مسار الدرس",
    "module": "وحدة الدرس",
    "orderIndex": "رقم ترتيب الدرس في الوحدة كعدد صحيح",
    "estimatedReadingMinutes": "الوقت التقديري بالدقائق كعدد صحيح"
  },
  "contentBlocks": [
    // مصفوفة تحتوي على كتل المحتوى مرتبة باستخدام orderIndex وبأنواعها المحددة:
    // (heading, paragraph, quran_verse, hadith, scholar_note, takeaway, reflection_question, image)
  ],
  "quiz": {
    "title": "عنوان الاختبار",
    "questions": [
      {
        "id": "معرف UUID v4 فريد للسؤال",
        "text": "نص السؤال",
        "options": [
          {
            "id": "معرف خيار فريد مثل o1, o2...",
            "text": "نص الخيار",
            "isCorrect": "قيمة منطقية true أو false",
            "explanation": "شرح وتفسير الخيار"
          }
        ]
      }
    ]
  },
  "references": [
    {
      "sourceName": "اسم الكتاب أو المرجع الأصيل",
      "detail": "تفصيل الموضع مثل رقم الصفحة أو رقم الحديث"
    }
  ],
  "seo": {
    "metaTitle": "عنوان محركات البحث الجاذب",
    "metaDescription": "وصف محركات البحث المختصر المناسب",
    "keywords": ["كلمات مفتاحية للبحث"]
  }
}
```

---

## المحتوى المراد تحويله:

[INJECT_APPROVED_CONTENT]
