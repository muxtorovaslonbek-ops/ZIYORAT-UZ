## Maqsad
Premium obunani **localStorage**'dan haqiqiy backend tizimiga ko'chirish:
- 🌍 **Chet ellik foydalanuvchilar** → Stripe orqali USD'da to'lov, **avtomatik** Premium yoqiladi
- 🇺🇿 **O'zbekiston foydalanuvchilari** → Click/Payme/Karta orqali sizning hisobingizga to'lov, chek yuklaydi → **siz admin paneldan tasdiqlaysiz** → Premium yoqiladi

---

## 1. Database (Lovable Cloud migration)

**Yangi jadvallar:**
- `subscriptions` — faol obunalar (`user_id`, `plan`, `started_at`, `expires_at`, `status`, `source`: 'stripe'|'manual')
- `payment_requests` — qo'lda to'lov so'rovlari (`user_id`, `plan`, `amount_uzs`, `receipt_url`, `payment_method`: click/payme/card, `status`: pending/approved/rejected, `admin_note`)
- `user_roles` + `app_role` enum (`admin`, `user`) — xavfsiz rol tizimi
- `has_role()` security-definer funksiyasi — RLS uchun

**Storage bucket:** `payment-receipts` (private, faqat egasi va adminlar ko'radi)

**RLS qoidalari:**
- Foydalanuvchi faqat o'z subscription/request'larini ko'radi
- Admin barcha `payment_requests`'ni ko'radi va yangilaydi
- `subscriptions` faqat backend (edge function) tomonidan yoziladi

---

## 2. Stripe (chet ellik avtomatik to'lov)

- Lovable'ning **built-in Stripe Payments**'ini yoqish (akkaunt shart emas, test rejim darhol ishlaydi)
- 3 ta Stripe **mahsulot**: 1m ($4.99), 3m ($12.99), 12m ($49.99) — recurring yoki one-time
- Edge function `stripe-checkout` → Checkout Session yaratadi
- Edge function `stripe-webhook` → `checkout.session.completed` event'da `subscriptions` jadvaliga yozadi

## 3. Manual to'lov (O'zbekiston)

- **Premium sahifasi**: foydalanuvchi planni tanlaydi → "Chek yuklash" formasi
  - Sizning kartangiz raqami / Click / Payme rekvizitlari ko'rsatiladi (siz sozlaysiz)
  - Foydalanuvchi to'lab, screenshot/chek yuklaydi
  - Forma `payment_requests`'ga `pending` status bilan yoziladi
- **Admin paneli** (`/admin/payments`):
  - Sizga "admin" roli berilgan
  - Pending so'rovlar ro'yxati: foydalanuvchi, plan, summa, chek rasmi
  - **"Tasdiqlash"** tugmasi → edge function `approve-payment` `subscriptions`'ga yozadi va `payment_requests`'ni `approved` qiladi
  - **"Rad etish"** + sabab maydoni

## 4. Frontend o'zgarishlar

- `usePremium()` hook — `localStorage` o'rniga Supabase'dan `subscriptions` jadvalini o'qiydi (realtime subscribe)
- `Premium.tsx` — endi 2 ta to'lov yo'li tab'i: 🌍 Stripe (USD) | 🇺🇿 Manual (UZS)
- `AdminPayments.tsx` — yangi sahifa, faqat adminlar uchun (`PremiumGate` o'rniga `AdminGate`)
- Navbar'da admin uchun "Admin" link (faqat rolli ko'rinadi)
- `lib/premium.ts` localStorage qismi olib tashlanadi
- `Profile`'da: "Mening obunam" — qachon tugashi, history

## 5. Sizdan kerak bo'ladi

1. **Stripe yoqilishi** — formada email kiritasiz (test rejim darhol ishlaydi, real to'lov uchun keyinroq verifikatsiya)
2. **Admin akkaunt** — qaysi email manzilingizga `admin` roli berilsin? (masalan ZIYORAT UZ asosiy akkauntingiz)
3. **To'lov rekvizitlari** (manual qism uchun ko'rsatiladi):
   - Karta raqami (Uzcard/Humo)
   - Click/Payme telefon yoki ID
   - Bular bazada `payment_settings` jadvalida saqlanadi, admin paneldan tahrirlash mumkin

---

## Texnik detallar

```text
Foydalanuvchi tanlaydi plan
  ├── 🌍 Stripe yo'li
  │     → checkout session → Stripe sahifasi → webhook → subscriptions++
  │     → darhol Premium yoqiladi
  └── 🇺🇿 Manual yo'li
        → rekvizit ko'radi → to'laydi → chek yuklaydi
        → payment_requests (pending) → admin ko'radi
        → admin "Tasdiqlash" → subscriptions++ → Premium yoqiladi
```

**Edge functions:**
- `stripe-checkout` (verify_jwt=true)
- `stripe-webhook` (verify_jwt=false, Stripe imzo tekshiradi)
- `approve-payment` (verify_jwt=true, faqat admin)

**Xavfsizlik:**
- Rollar alohida `user_roles` jadvalda (privilege escalation himoyasi)
- `has_role()` SECURITY DEFINER — RLS rekursiyasini oldini oladi
- Faqat backend `subscriptions`'ga yozadi
- Stripe webhook imzosi tekshiriladi

## Bosqichlar

1. Database migration (jadvallar, rollar, storage, RLS) — sizdan tasdiq olib bajaraman
2. Stripe payments yoqish — formani siz to'ldirasiz
3. 3 ta Stripe mahsulot yaratish
4. Edge functions yozish (checkout, webhook, approve)
5. Frontend yangilash (usePremium → Supabase, Premium sahifa qayta yozish)
6. Admin panel yaratish + sizga `admin` roli berish
7. Test: chek yuklash → tasdiqlash flow, Stripe test karta bilan checkout
