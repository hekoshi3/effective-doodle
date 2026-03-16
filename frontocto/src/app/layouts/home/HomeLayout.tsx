import AuthProvider from "@/app/providers/AuthProvider";
import { Suspense } from "react";

export function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
            <AuthProvider>
                <Suspense fallback={<div>Loading...</div>}>
                </Suspense>

                {children}
            </AuthProvider>

        </div>
    );
}
