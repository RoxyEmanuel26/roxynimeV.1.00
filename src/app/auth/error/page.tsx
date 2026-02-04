"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "Access denied. You do not have permission to sign in.",
        Verification: "The verification link has expired or is invalid.",
        OAuthSignin: "Could not start the sign in process.",
        OAuthCallback: "Could not complete the sign in process.",
        OAuthCreateAccount: "Could not create account using this provider.",
        EmailCreateAccount: "Could not create account with this email.",
        Callback: "An error occurred during the callback.",
        OAuthAccountNotLinked:
            "This email is already associated with another account.",
        EmailSignin: "Could not send the email. Please try again.",
        CredentialsSignin: "Invalid email or password.",
        SessionRequired: "Please sign in to access this page.",
        Default: "An authentication error occurred.",
    };

    const message = error
        ? errorMessages[error] || errorMessages.Default
        : errorMessages.Default;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                    <p className="text-muted-foreground">{message}</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/auth/signin" className="btn-primary w-full py-3">
                        Try Again
                    </Link>
                    <Link href="/" className="btn-outline w-full py-3">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense>
            <ErrorContent />
        </Suspense>
    );
}
