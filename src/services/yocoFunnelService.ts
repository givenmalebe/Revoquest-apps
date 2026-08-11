import { getFunctions, httpsCallable } from 'firebase/functions';

export interface CreateCheckoutParams {
  courseId: string;
  courseTitle: string;
  amountCents: number;
  customerEmail: string;
  firstName: string;
  lastName: string;
  /** Password for new account; user will verify email via link, then log in with this password */
  password?: string;
   /** Optional national ID / identity number to store on the learner profile (used as ID NO on certificates) */
  identityNumber?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResult {
  success: boolean;
  redirectUrl?: string;
  checkoutId?: string;
  error?: string;
}

export async function createYocoCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const functions = getFunctions();
  const createCheckout = httpsCallable<
    CreateCheckoutParams,
    { success: boolean; redirectUrl?: string; checkoutId?: string; error?: string }
  >(functions, 'createYocoCheckout');
  const result = await createCheckout(params);
  const data = result.data as CreateCheckoutResult;
  return data;
}

export interface CompleteEnrollmentResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CheckEmailRegisteredResult {
  registered: boolean;
}

export async function checkFunnelEmailRegistered(email: string): Promise<CheckEmailRegisteredResult> {
  const functions = getFunctions();
  const fn = httpsCallable<{ email: string }, { registered: boolean }>(
    functions,
    'checkFunnelEmailRegistered'
  );
  const result = await fn({ email: email.trim() });
  return { registered: (result.data as CheckEmailRegisteredResult).registered };
}

export async function completeFunnelEnrollmentByEmail(email: string): Promise<CompleteEnrollmentResult> {
  const functions = getFunctions();
  const fn = httpsCallable<{ email: string }, { success: boolean; message?: string; error?: string }>(
    functions,
    'completeFunnelEnrollmentByEmail'
  );
  const result = await fn({ email: email.trim() });
  const data = result.data as CompleteEnrollmentResult;
  return data;
}

/** Complete enrollment for the current user (after payment). Finds pending checkout by user email and adds course to My Courses. */
export interface CompleteEnrollmentForCurrentUserResult {
  success: boolean;
  courseId?: string;
  message?: string;
  error?: string;
}

export async function completeEnrollmentForCurrentUser(): Promise<CompleteEnrollmentForCurrentUserResult> {
  const functions = getFunctions();
  const fn = httpsCallable<
    void,
    { success: boolean; courseId?: string; message?: string; error?: string }
  >(functions, 'completeEnrollmentForCurrentUser');
  const result = await fn();
  return result.data as CompleteEnrollmentForCurrentUserResult;
}

/** Create Yoco checkout for a logged-in learner. Requires Firebase Auth. On success, webhook enrolls the user. */
export async function createYocoCheckoutForLearner(params: {
  courseId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CreateCheckoutResult> {
  const functions = getFunctions();
  const createCheckout = httpsCallable<
    { courseId: string; successUrl: string; cancelUrl: string },
    { success: boolean; redirectUrl?: string; checkoutId?: string; error?: string }
  >(functions, 'createYocoCheckoutForLearner');
  const result = await createCheckout(params);
  const data = result.data as CreateCheckoutResult;
  return data;
}

/** Check if an identity number is already used by an existing user */
export async function checkIdentityNumberUsed(identityNumber: string): Promise<{ used: boolean }> {
  const functions = getFunctions();
  const fn = httpsCallable<{ identityNumber: string }, { used: boolean }>(
    functions,
    'checkIdentityNumberUsed'
  );
  const result = await fn({ identityNumber: identityNumber.trim() });
  return { used: (result.data as { used: boolean }).used };
}

/** Enroll a first-time user for free (verified by identity number) */
export async function freeFirstCourseEnrollment(params: {
  courseId: string;
  customerEmail: string;
  firstName: string;
  lastName: string;
  password?: string;
  identityNumber: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const functions = getFunctions();
  const fn = httpsCallable<typeof params, { success: boolean; message?: string; error?: string }>(
    functions,
    'freeFirstCourseEnrollment'
  );
  const result = await fn(params);
  return result.data as { success: boolean; message?: string; error?: string };
}

/** Admin-only: grant course access to a learner by email (e.g. after purchase if webhook didn't run). */
export interface GrantCourseAccessResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function grantCourseAccessByEmail(email: string, courseId?: string): Promise<GrantCourseAccessResult> {
  const functions = getFunctions();
  const fn = httpsCallable<
    { email: string; courseId?: string },
    { success: boolean; message?: string; error?: string }
  >(functions, 'grantCourseAccessByEmail');
  const result = await fn({ email: email.trim(), courseId: courseId?.trim() });
  const data = result.data as GrantCourseAccessResult;
  return data;
}
