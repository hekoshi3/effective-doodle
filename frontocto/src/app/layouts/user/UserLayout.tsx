import { Suspense } from "react";

export function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
                

                <div className="flex flex-col overflow-x-clip">
                    <main className="flex grow flex-col">{children}</main>
                </div>
        </div>
    );
}
