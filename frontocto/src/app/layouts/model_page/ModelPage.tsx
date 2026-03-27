import { Suspense } from "react";

export function ModelLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
                <Suspense fallback={<div>Loading...</div>}>
                </Suspense>

                <div className="overflow-x-clip">
                    <main className="">{children}</main>
                </div>
        </div>
    );
}
