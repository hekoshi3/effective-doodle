import { Suspense } from "react";

export function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Suspense fallback={<div>Loading...</div>}>
            </Suspense>
            
            {children}
        </html>
    );
}
