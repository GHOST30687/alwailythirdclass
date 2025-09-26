# 🔧 تعليمات إعداد JSONBin.io

## ✅ **تم تحديث الكود بنجاح!**

الآن تحتاج فقط لإدخال بيانات JSONBin الخاصة بك في الكود.

## 📍 **أين تضع البيانات:**

افتح ملف `main.js` وابحث عن هذا الجزء في **بداية الملف** (السطر 4-8):

```javascript
// ⚠️ JSONBin.io Configuration - أدخل بياناتك هنا
const JSONBIN_CONFIG = {
  API_KEY: 'YOUR_MASTER_KEY_HERE', // 🔑 ضع الـ Master Key هنا
  HOMEWORK_BIN: 'YOUR_HOMEWORK_BIN_ID_HERE', // 📚 ضع bin ID للواجبات هنا
  ANNOUNCEMENTS_BIN: 'YOUR_ANNOUNCEMENTS_BIN_ID_HERE', // 📢 ضع bin ID للتبليغات هنا
  BASE_URL: 'https://api.jsonbin.io/v3/b'
};
```

## 🔄 **استبدل البيانات كالتالي:**

1. **استبدل** `'YOUR_MASTER_KEY_HERE'` **بالـ Master Key الخاص بك**
2. **استبدل** `'YOUR_HOMEWORK_BIN_ID_HERE'` **بـ bin ID الخاص بالواجبات**
3. **استبدل** `'YOUR_ANNOUNCEMENTS_BIN_ID_HERE'` **بـ bin ID الخاص بالتبليغات**

## 💡 **مثال:**

```javascript
const JSONBIN_CONFIG = {
  API_KEY: '$2a$10$abcd1234efgh5678ijkl9012mnop3456', // 🔑 المفتاح الحقيقي
  HOMEWORK_BIN: '63f2b8c8c0e7653a052b1234', // 📚 ID الواجبات الحقيقي
  ANNOUNCEMENTS_BIN: '63f2b8c8c0e7653a052b5678', // 📢 ID التبليغات الحقيقي
  BASE_URL: 'https://api.jsonbin.io/v3/b'
};
```

## ⚡ **بعد التعديل:**

1. **احفظ الملف**
2. **افتح الموقع** في المتصفح
3. **اختبر إنشاء واجب أو تبليغ**
4. **تأكد من ظهوره للمستخدمين الآخرين**

## ✨ **الآن الموقع سيعمل للجميع!**

- كل طالب سيرى نفس الواجبات
- التبليغات ستظهر لكل الطلاب
- البيانات محفوظة على الإنترنت، ليس محلياً

## 🆘 **إذا واجهت مشاكل:**

1. **تأكد من صحة البيانات** (API Key و Bin IDs)
2. **افتح Console في المتصفح** (F12) لرؤية أي أخطاء
3. **تأكد من اتصال الإنترنت**

---

**🎉 أصبح موقعك جاهز للاستخدام من قبل جميع الطلاب!**