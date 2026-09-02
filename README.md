# جدول الشفتات — شركة رواد النخبة للاستقدام
نسخة أونلاين قابلة للتعديل (تشغيل 24 ساعة) بقاعدة بيانات على الخادم.

## التشغيل محلياً
```
npm start
```
ثم افتح http://localhost:8090

## التشغيل أونلاين (Render / Railway / Glitch)
1. ارفع المستودع على GitHub.
2. في Render: New → Web Service، وحدد:
   - Build Command: (لا يوجد)
   - Start Command: `npm start`
   - Port: `8090`
3. البيانات تُحفظ في `data/schedule.json` على الخادم (لكل منصة ملف دائم عبر Disk أو عبر تصدير/استيراد JSON).

## الواجهات
- `GET /api/schedule` — قراءة الجدول
- `POST /api/schedule` — حفظ الجدول
- `PUT /api/schedule` — استرجاع البذرة الافتراضية
