export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          CodeProof
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Client login
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
