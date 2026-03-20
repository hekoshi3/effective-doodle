import { Suspense } from "react";

export function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
            <Suspense fallback={<div>Loading...</div>}>
            </Suspense>
            <main className="">{children}</main>
        </div>
    );
}
