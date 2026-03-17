import AuthProvider from "@/app/providers/AuthProvider";
import { Header } from "@/widgets/header";
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
