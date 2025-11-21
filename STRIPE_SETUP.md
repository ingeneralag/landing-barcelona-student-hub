# إعداد Stripe Payment Elements

## الخطوات المطلوبة

### 1. الحصول على مفاتيح Stripe

1. سجل في [Stripe Dashboard](https://dashboard.stripe.com/)
2. احصل على **Publishable Key** و **Secret Key**
3. في وضع التطوير (Development)، استخدم **Test Keys**

### 2. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. إنشاء Backend Endpoint

تحتاج إلى إنشاء endpoint في backend لإنشاء PaymentIntent. مثال باستخدام Node.js/Express:

```javascript
// Backend: /api/create-payment-intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, roomId, customerInfo, bookingDates } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // في السنتات (مثلاً: 55000 = 550€)
      currency: currency || 'eur',
      metadata: {
        roomId: roomId.toString(),
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        checkIn: bookingDates.checkIn,
        checkOut: bookingDates.checkOut,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. إعداد CORS

تأكد من إعداد CORS في backend للسماح للـ frontend بالوصول:

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080', // أو domain الإنتاج
}));
```

### 5. تحديث Checkout.tsx

في ملف `src/pages/Checkout.tsx`، قم بتحديث URL الـ API:

```typescript
const response = await fetch('http://localhost:3000/api/create-payment-intent', {
  // ... rest of the code
});
```

## ملاحظات مهمة

- **لا تضع Secret Key في Frontend** - استخدمه فقط في Backend
- استخدم **Test Mode** أثناء التطوير
- اختبر الدفع باستخدام [Stripe Test Cards](https://stripe.com/docs/testing)
- في الإنتاج، استخدم **Live Keys** و HTTPS

## بطاقات الاختبار

- **نجاح**: `4242 4242 4242 4242`
- **فشل**: `4000 0000 0000 0002`
- أي تاريخ مستقبلي و CVV: `123`

