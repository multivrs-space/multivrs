import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";
import { normalizeAuthReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = {
  title: "Sign in · Multivrs",
  description: "Sign in to your Multivrs account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-foreground/5" />
      </div>
      <div className="space-y-3">
        <div className="h-10 w-full rounded-lg bg-muted" />
        <div className="h-10 w-full rounded-lg bg-foreground/5" />
      </div>
      <div className="h-11 w-full rounded-lg bg-muted" />
    </div>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await redirectAuthenticatedUser();
  const { from } = await searchParams;
  return <SignInForm returnTo={normalizeAuthReturnPath(from)} />;
}
