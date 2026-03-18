import { Header } from "@/widgets/header";
import { Suspense } from "react";

export function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
                <Suspense fallback={<div>Loading...</div>}>
                </Suspense>

                <div className="flex flex-col overflow-x-clip">
                    <Header />
                    <main className="flex grow flex-col">{children}</main>
                </div>
        </div>
    );
}
