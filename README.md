# موقع ثانوية الوائلي للمتميزين - واجبات الثالث متوسط

## المشكلة الحالية
الموقع يستخدم localStorage، مما يعني أن كل طالب يرى البيانات على جهازه فقط. الواجبات والتبليغات لا تظهر للطلاب الآخرين.

## الحلول المقترحة

### 1. الحل الأبسط: استخدام خدمة JSON مجانية
استخدام خدمات مثل:
- **JSONBin.io** (مجاني حتى 100,000 requests شهرياً)
- **My JSON Server** (مجاني لـ GitHub repositories)
- **Firebase Realtime Database** (مجاني حتى 10GB)

### 2. الحل المتوسط: استضافة على GitHub Pages
- رفع الموقع على GitHub Pages
- استخدام GitHub API لحفظ البيانات في ملفات JSON
- مجاني تماماً ولكن محدود

### 3. الحل المتقدم: خادم حقيقي
- استضافة على Vercel أو Netlify (مجاني)
- استخدام MongoDB Atlas (مجاني حتى 512MB)
- إضافة backend بـ Node.js

## التعديلات المطلوبة للحل الأول (JSONBin.io)

### 1. إنشاء حساب على JSONBin.io
1. اذهب إلى https://jsonbin.io
2. أنشئ حساب مجاني
3. أنشئ bin جديد للواجبات وآخر للتبليغات
4. احصل على API Key

### 2. تعديل الكود
استبدال localStorage بـ API calls:

```javascript
// بدلاً من localStorage
const API_KEY = 'YOUR_API_KEY_HERE';
const HOMEWORK_BIN = 'YOUR_HOMEWORK_BIN_ID';
const ANNOUNCEMENTS_BIN = 'YOUR_ANNOUNCEMENTS_BIN_ID';

// دوال للتعامل مع API
async function getHomework() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${HOMEWORK_BIN}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    return data.record || [];
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
}

async function setHomework(homeworkList) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${HOMEWORK_BIN}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(homeworkList)
    });
  } catch (error) {
    console.error('Error saving homework:', error);
  }
}
```

## الخطوات للتطبيق

1. **اختر الحل المناسب** حسب احتياجاتك وإمكانياتك
2. **أنشئ الحسابات المطلوبة** للخدمات المختارة
3. **عدّل الكود** ليستخدم API بدلاً من localStorage
4. **اختبر الموقع** مع عدة مستخدمين
5. **ارفع الموقع** على خادم حقيقي

## ملاحظات مهمة
- الحل الحالي (localStorage) يعمل فقط محلياً
- لمشاركة البيانات تحتاج خادم أو خدمة cloud
- جميع الحلول المقترحة مجانية للاستخدام الأساسي

## التواصل
إذا كنت تحتاج مساعدة في التطبيق، يمكنني مساعدتك في تطبيق أي من هذه الحلول.