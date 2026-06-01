# Firebase Cloud Functions

## Deploy

From the project root:

```bash
firebase deploy --only functions
```

To deploy everything (functions, firestore rules, hosting):

```bash
firebase deploy
```

## Admin user delete (`deleteUserByAdmin`)

When an admin deletes a user from **Users Management** in the admin dashboard, the app calls the callable function `deleteUserByAdmin`. This function:

1. Verifies the caller is authenticated and has role `admin` (via Firestore `users/{uid}.role`).
2. Deletes the user from **Firebase Authentication** (so they can no longer sign in).
3. Deletes the user document from **Firestore** `users/{userId}`.

**Required:** Deploy the functions so this runs on Firebase (client cannot delete other users from Auth). Firestore rules already allow admins to manage user documents; the function uses the Admin SDK and runs with full access.
