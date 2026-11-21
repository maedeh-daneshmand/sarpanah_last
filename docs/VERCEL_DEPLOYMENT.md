# راهنمای استقرار فرانتاند سرپناه روی Vercel

سامانه سرپناه به صورت کاملاً ماژولار و سازگار با پلتفرم Vercel پیاده‌سازی شده است و هیچ‌گونه وابستگی هاردکد شده به `localhost` ندارد.

---

## ۱. تنظیم متغیرهای محیطی در پنل Vercel

هنگام ایجاد یا ویرایش پروژه در داشبورد Vercel (قسمت **Settings > Environment Variables**)، متغیر زیر را ثبت کنید:

| نام متغیر | مقدار پیشنهادی برای Production | توضیحات |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.yourdomain.com/api/v1` | آدرس عمومی بکاند آنلاین (FastAPI) |

> **نکته امنیتی:** هیچ‌گونه توکن، رمز دیتابیس یا کلید مخفی (Secret Key) نباید با پیشوند `NEXT_PUBLIC_` تعریف شود.

---

## ۲. تنظیمات دامنه و CORS در بکاند FastAPI

برای اینکه فرانتاند مستقر روی دامنه‌های Vercel بتواند بدون مسدودی به بکاند متصل شود، در فایل `sar-panah/app/main.py` بکاند، تنظیمات CORS انجام شده است:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # یا دامنه‌های مشخص مانند https://sarpanah.vercel.app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ۳. تنظیمات دامنه‌های مجاز تصاویر (Next.js Image)

تصاویر در `next.config.js` به نحوی پیکربندی شده‌اند که امکان بارگذاری عکس‌ها از کلیه هاست‌های امن اینترنتی مانند Unsplash یا فضای آپلود ذخیره‌سازی ابری مهیا باشد:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
  ],
}
```

---

## ۴. مراحل دیپلوی (Deployment Steps)

1. مخزن گیت خود را به حساب کاربری Vercel متصل کنید.
2. فریم‌ورک پروژه به طور خودکار به عنوان **Next.js** شناسایی می‌شود.
3. در قسمت Root Directory، ریشه پروژه فرانتاند را مشخص نمایید.
4. دکمه **Deploy** را بزنید تا پروژه بیلد و منتشر شود.
