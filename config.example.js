// ملف الإعدادات - انسخ هذا الملف إلى config.js وأضف القيم الحقيقية
// 🔐 هذا مثال على ملف الإعدادات - يجب إنشاء config.js منفصل

export const CONFIG = {
  // JSONBin.io API Configuration
  JSONBIN_API_KEY: 'ضع_مفتاح_API_الخاص_بك_هنا', // 🔑 مفتاح API من JSONBin.io
  
  // Bin IDs for different data types
  BINS: {
    HOMEWORK: 'ضع_معرف_bin_الواجبات_هنا',        // 📚 معرف bin الواجبات
    ANNOUNCEMENTS: 'ضع_معرف_bin_التبليغات_هنا',  // 📢 معرف bin التبليغات  
    CODES: 'ضع_معرف_bin_الأكواد_هنا'             // 🧩 معرف bin أكواد الطلاب
  },
  
  // API Configuration
  BASE_URL: 'https://api.jsonbin.io/v3/b',
  
  // Admin Configuration
  ADMIN: {
    CODE: 'baqermanee',
    NAME: 'باقر أسعد حسين'
  },
  
  // Application Settings
  SETTINGS: {
    LOCK_TTL_MS: 120000,        // مدة صلاحية القفل (2 دقيقة)
    HEARTBEAT_INTERVAL_MS: 30000, // نبض كل 30 ثانية
    REQUEST_TIMEOUT_MS: 10000,    // مهلة الطلبات
    AUTO_ARCHIVE_INTERVAL_MS: 60000 // فحص الأرشفة التلقائية كل دقيقة
  }
};