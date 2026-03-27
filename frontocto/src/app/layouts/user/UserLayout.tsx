export function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en">
                <div className="overflow-x-clip">
                    <main className="">{children}</main>
                </div>
        </div>
    );
}
