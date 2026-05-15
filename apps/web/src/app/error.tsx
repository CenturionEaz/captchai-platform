"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Something went wrong</h1>
            </div>
        </div>
    );
}