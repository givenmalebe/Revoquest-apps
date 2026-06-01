# Funnel (ad landing + Yoco payment)

The funnel is part of the main app and is available at these routes:

- **Landing:** `/funnel` – Lists published courses; users pick one and go to checkout.
- **Checkout:** `/funnel/checkout/:courseId` – Form (name, email) and “Pay with Yoco” → redirects to Yoco.
- **Success:** `/funnel/success` – Shown after successful payment; link to learner dashboard.
- **Cancel:** `/funnel/cancel` – Shown if the user cancels on Yoco.

## Flow

1. User opens `/funnel` (e.g. from a social ad).
2. Clicks “Get this course” on a course → `/funnel/checkout/:courseId`.
3. Enters first name, last name, email → clicks “Pay with Yoco”.
4. App calls Cloud Function `createYocoCheckout` → user is redirected to Yoco’s payment page.
5. After payment, Yoco redirects to `/funnel/success` and sends a webhook to our `yocoWebhook` function.
6. **User creation (webhook or success-page fallback):** creates or finds Firebase Auth user, creates/updates Firestore user with `enrolledCourses`, adds `enrollments` and `studentProgress` records, sends email (set password for new users; “course added” for existing).
7. User sets password (from email link) and logs in at `/lms`; the learner dashboard shows the paid course via enrollments and they can access it.

## Setup

### 1. Yoco

- Create a Yoco account and get API keys: https://portal.yoco.com/online/plugin-keys
- **Secret key** (use `sk_test_...` for testing) must be set as a Firebase secret (2nd gen functions):
  ```bash
  npx firebase functions:secrets:set YOCO_SECRET_KEY
  ```
  When prompted, paste your Yoco test or live secret key (e.g. `sk_test_...`). Then deploy:
  ```bash
  npx firebase deploy --only functions
  ```

- **Webhook (required for user creation and enrollment):** In Yoco’s dashboard, register your webhook URL. For 2nd gen functions the URL is shown after deploy (e.g. `Function URL (yocoWebhook): https://...run.app`). Use that URL, or the pattern:
  ```
  https://<region>-<project-id>.cloudfunctions.net/yocoWebhook
  ```
  Subscribe to events `payment.succeeded` and/or `checkout.completed` so we create the user and enroll them in the course.

### 2. Firebase

- **Auth:** After payment, the webhook creates a Firebase Auth user and emails a "Create your password" link. Ensure your app domain (e.g. `revoquest.co.za`) is in [Firebase Console → Authentication → Authorized domains](https://console.firebase.google.com/project/_/authentication/settings) so the password-reset redirect to `/lms` works.
- Firestore: `courses` are readable by anyone so the funnel can list them. `checkoutSessions` is used only by Cloud Functions.
- Deploy functions (including `createYocoCheckout` and `yocoWebhook`) and Firestore rules after any change.

### 3. Courses

- Only **published** courses (`isPublished: true`) are shown on the funnel.
- Each course must have a **price** in the main currency (e.g. ZAR); it’s converted to cents for Yoco.

## Links for ads

- Landing: `https://<your-domain>/funnel`
- Optional UTM params: `?utm_source=facebook&utm_campaign=...` for analytics.
