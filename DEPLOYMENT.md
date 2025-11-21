# تعليمات الرفع على السيرفر (Deployment Guide)

## الطريقة السريعة (Deploy Script)

### 1. إعداد ملف التكوين
```bash
cp .env.deploy.example .env.deploy
# ثم عدّل .env.deploy بمعلومات السيرفر
```

### 2. الرفع التلقائي
```bash
npm run deploy
# أو
./deploy.sh
```

## متغيرات البيئة المطلوبة

### على السيرفر (Backend - Node.js)
أنشئ ملف `.env` في مجلد المشروع أو اضبط متغيرات البيئة في إعدادات السيرفر:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
PORT=4242
```

### على السيرفر (Frontend - Vite)
أضف هذه المتغيرات في إعدادات البيئة أو في ملف `.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
VITE_BACKEND_URL=https://alojamiento-barcelona.com
```

**ملاحظة:** استبدل `https://alojamiento-barcelona.com` بـ URL السيرفر الفعلي.

## خطوات الرفع اليدوي

### 1. بناء المشروع
```bash
npm run build
```

### 2. رفع الملفات
```bash
# باستخدام rsync
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@server:/var/www/alojamiento-barcelona/

# أو باستخدام scp
scp -r ./ user@server:/var/www/alojamiento-barcelona/
```

### 3. على السيرفر
```bash
cd /var/www/alojamiento-barcelona
npm install --production
npm run build
pm2 restart server  # أو systemctl restart alojamiento-barcelona
```

## إعداد Deploy Script

### 1. إنشاء ملف `.env.deploy`:
```bash
cp .env.deploy.example .env.deploy
```

### 2. تعديل `.env.deploy`:
```env
SSH_HOST=your-server.com
SSH_USER=your-username
SSH_PORT=22
SSH_KEY_PATH=~/.ssh/id_rsa
SERVER_PROJECT_PATH=/var/www/alojamiento-barcelona
BUILD_COMMAND="npm run build"
RESTART_BACKEND="pm2 restart server"
```

### 3. استخدام Script:
```bash
npm run deploy
```

## تسجيل الدومين في Stripe

1. اذهب إلى: https://dashboard.stripe.com/settings/payment_method_domains
2. اضغط "+ Add a new domain"
3. أدخل الدومين: `alojamiento-barcelona.com` (بدون www أو مع www حسب إعداداتك)
4. اتبع التعليمات لتحميل ملف التحقق إذا طُلب
5. انتظر حتى يصبح الحالة "Verified" أو "Active"

## التحقق من الإعدادات

### تحقق من أن المفاتيح موجودة:
```bash
# على السيرفر
echo $STRIPE_SECRET_KEY
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

### تحقق من أن الخادم يعمل:
```bash
curl http://localhost:4242/api/rooms
```

### تحقق من Console في المتصفح:
- افتح Developer Tools (F12)
- اذهب إلى Console
- ابحث عن: "Stripe Publishable Key: pk_test..."
- إذا لم تجده، المفاتيح غير موجودة في متغيرات البيئة

## حل المشاكل الشائعة

### 1. PaymentElement لا يتم تحميله
**السبب:** المفاتيح غير موجودة أو PaymentIntent فشل
**الحل:** 
- تحقق من متغيرات البيئة
- تحقق من Console للأخطاء
- تأكد من أن Backend يعمل

### 2. 400 Bad Request من Stripe
**السبب:** `STRIPE_SECRET_KEY` غير موجود أو غير صحيح
**الحل:** 
- تأكد من وجود المفتاح في متغيرات البيئة
- تأكد من أن المفتاح صحيح (يبدأ بـ `sk_test_` أو `sk_live_`)

### 3. Apple Pay لا يظهر
**السبب:** الدومين غير مسجل في Stripe
**الحل:**
- سجّل الدومين في Stripe Dashboard
- تأكد من HTTPS
- انتظر بضع دقائق بعد التسجيل

### 4. مشاكل SSH في Deploy Script
**السبب:** SSH key غير موجود أو غير صحيح
**الحل:**
- تأكد من أن SSH key موجود: `ls -la ~/.ssh/id_rsa`
- أضف SSH key إلى ssh-agent: `ssh-add ~/.ssh/id_rsa`
- اختبر الاتصال: `ssh -p 22 user@server`

## نصائح إضافية

- استخدم Test Keys للتطوير و Live Keys للإنتاج
- لا ترفع ملف `.env` أو `.env.deploy` إلى Git (موجود في `.gitignore`)
- استخدم PM2 أو systemd لإدارة الخادم في الإنتاج
- راقب Logs بانتظام للتحقق من الأخطاء
- استخدم `npm run check-env` للتحقق من متغيرات البيئة
