# Google Play Compliance — Gaps (CTMASS mobile)

Аудит против [Google Play Developer Program Policies](https://play.google/developer-content-policy/).
Здесь — только то, чего **нет** в 9 задачах App Store и в [APP-STORE-COMPLIANCE.md](APP-STORE-COMPLIANCE.md). Пересекающееся не дублируем.

Дата: 2026-09-03. Приложение: home-services маркетплейс, вход Google/Apple, UGC (чат/профили/проекты), аналитика (SDK установлены), магазин на коинах, US-only.

**Легенда:** 🔴 блокер публикации · 🟡 проверить/поправить · 📋 действие в Play Console (не код) · ✅ уже сделано.

---

## ✅ Уже закрыто кодом (пересечение с 9 задачами — не блокеры)
- **User-Generated Content policy** — фильтр публикации (задача 1) + Report (2) + Block (3) + Contact (7). Требуется Google так же, как Apple 1.2.
- **Account deletion** — `deleteMyAccount` + кнопка в Profile (сделано ранее) + публичная страница `ctmass.com/data-deletion`.
- **Camera/Photos** — разрешение камеры добавлено (задача 8).
- **Privacy policy** — `ctmass.com/privacy-policy`, ссылки в приложении (задача 5).

---

## 🔴 / 🟡 Специфичное для Google Play (нужно доделать)

### 1. 📋 Data Safety form (Play Console) — заполнить и согласовать с App Privacy у Apple
**Требование:** задекларировать все собираемые данные, цели, шифрование, удаление.
**Что вписать (как в Apple App Privacy):** email, имя, телефон, адрес, сообщения, фото, User ID, device/advertising ID, usage/diagnostics. Encrypted in transit = Yes. Data deletion = Yes → `https://ctmass.com/data-deletion`. **Согласовать один-в-один** с тем, что указано в Apple.

### 2. 🟡 AD_ID (Advertising ID) — разрешение + декларация
**Требование:** `@react-native-firebase/analytics` (Amplitude/Clarity тоже) **авто-добавляют** `com.google.android.gms.permission.AD_ID`. Google требует задекларировать AD_ID в **Data safety** и в **App content → Advertising ID** (Yes, purpose Analytics).
**Важно:** на Android **нет ATT** (задача 6 = только iOS). Если реально трекинг не ведётся (SDK пока не инициализированы) — либо не собирать AD_ID (добавить `tools:node="remove"` для этого permission через config-plugin), либо честно задекларировать «Yes». Определиться вместе с решением по аналитике из App Store doc.

### 3. 🟡 Target API level
**Требование:** таргетить актуальный Android API (Google каждый год поднимает минимум; на 2025 — API 35 / Android 15).
**Проверить:** Expo SDK 57 таргетит свежий API — подтвердить `targetSdkVersion` в собранном AAB (обычно 35). Если ниже минимума — Play не примет апдейт. Скорее всего ок, но проверить в бандле.

### 4. 🟡 Photo/Video Permissions (Android 13+)
**Требование:** Google ограничивает широкий доступ к медиа; для выбора фото надо использовать **Android Photo Picker**, а не `READ_MEDIA_IMAGES`, если широкий доступ не является core-функцией.
**Проверить:** `expo-image-picker` (SDK 57) по умолчанию использует системный Photo Picker (broad-permission не требуется). Если в манифесте всё же появится `READ_MEDIA_IMAGES` — заполнить декларацию **Photo and Video Permissions** в Play Console или убедиться, что используется picker. Камера (задача 8) — отдельное `CAMERA` permission, с prominent-цель в описании.

### 5. 🟡 Prominent Disclosure & Consent
**Требование:** до сбора персональных данных, не очевидных из контекста, показать явное уведомление.
**Оценка:** адрес вводит сам пользователь для матчинга (очевидно) → ок. Device location в фоне — **нет** (нет GPS). Аналитика (device/usage) — не очевидна: покрыть **privacy policy + Data safety**; на Android явного prompt нет (ATT только iOS). Если добавите трекинг — рассмотреть in-app consent-баннер для аналитики на Android.

### 6. 🟡 Package visibility / QUERY_ALL_PACKAGES
**Оценка:** «Contact support» (задача 7) и WebView используют `Linking.openURL` (mailto / https) — это **не** требует `QUERY_ALL_PACKAGES` и `<queries>`. Google Sign-In сам добавляет нужные `<queries>`. **Широкий QUERY_ALL_PACKAGES не нужен** — не добавлять (иначе отдельная декларация и ревью).

### 7. 🟡 Payments / Play Billing (коины)
**Оценка:** коины **не покупаются за деньги** в приложении (Stripe только на вебе) → Play Billing **не требуется**. Если появится покупка коинов/цифрового за деньги в Android-приложении — обязателен **Google Play Billing** (как Apple IAP). Указать, что коины — виртуальная валюта без вывода в деньги.

### 8. 🟡 Impersonation
**Требование:** не допускать выдачу себя за чужого специалиста/бренд в профилях.
**Покрытие:** Report + Block + модерация репортов (задачи 2/3) + ручной разбор `reports`. Достаточно.

---

## 📋 Play Console — декларации (App content), ответы под приложение

| Раздел | Ответ |
|---|---|
| **Data safety** | заполнить (см. п.1), Data deletion = Yes |
| **Advertising ID** | Yes (Analytics) — если трекинг включён; иначе убрать AD_ID |
| **Ads** | **No** (рекламы в приложении нет) |
| **Content rating (IARC)** | пройти анкету (UGC=Yes, насилие/секс/наркотики=None) → низкий рейтинг |
| **Target audience & content** | **18+** (взрослые), без Families |
| **News app** | No |
| **COVID-19 apps** | No |
| **Government apps** | No |
| **Financial features** | No (коины ≠ финансы; реальных платежей в приложении нет) |
| **Health apps** | No |
| **Data safety → deletion URL** | `https://ctmass.com/data-deletion` |
| **Privacy policy** | `https://ctmass.com/privacy-policy` |

---

## Отличия Google от Apple (кратко)
- Нет ATT — вместо этого **AD_ID declaration + Data safety** (задача 6 покрывает только iOS).
- Photo Picker вместо broad media-permission (Android 13+).
- **12 тестеров / 14 дней** closed testing до production (для personal-аккаунта) — организационное, не код.
- Play Billing вместо Apple IAP — не требуется, пока нет покупок за деньги.

## Приоритет
1. **Data safety form** (п.1) — обязательно, согласовать с Apple App Privacy.
2. **AD_ID** решение (п.2) — вместе с аналитикой.
3. Проверить **Target API** (п.3) и **Photo Picker** (п.4) в собранном AAB.
4. Остальные декларации (таблица) — заполнить в App content.

Всё «кодовое» по UGC/удалению/камере уже сделано в рамках 9 задач — здесь остаются в основном **консольные декларации** и пара **Android-проверок** в бандле.
