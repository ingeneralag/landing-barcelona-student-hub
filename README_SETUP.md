# إعداد Stripe - تعليمات سريعة

## تم إعداد المفاتيح التالية:

✅ **Publishable Key**: تم إضافتها في `.env` و `Checkout.tsx`
✅ **Secret Key**: تم إضافتها في `.env` و `server.js`

## كيفية التشغيل:

### الطريقة 1: تشغيل كل شيء معاً (موصى بها)
```bash
npm run dev:all
```
هذا سيشغل:
- Frontend على `http://localhost:8080`
- Backend على `http://localhost:3000`

### الطريقة 2: تشغيل منفصل

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

## اختبار الدفع:

1. افتح `http://localhost:8080`
2. اختر غرفة → اختر التواريخ → اضغط "حجز الآن"
3. في صفحة Checkout، املأ البيانات
4. استخدم بطاقة اختبار Stripe:
   - **رقم البطاقة**: `4242 4242 4242 4242`
   - **التاريخ**: أي تاريخ مستقبلي (مثلاً 12/25)
   - **CVV**: أي 3 أرقام (مثلاً 123)
   - **ZIP**: أي 5 أرقام (مثلاً 12345)

## ملاحظات:

- ✅ الـ Publishable Key آمنة في Frontend
- ✅ الـ Secret Key موجودة فقط في Backend (server.js)
- ⚠️ لا تشارك الـ Secret Key أبداً

