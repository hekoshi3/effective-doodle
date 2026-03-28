import { SettingsNav } from "@/widgets/settingsNav";

export function SettingsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div lang="en" className="flex flex-row bg-neutral-900">
            <aside className="basis-1/4"><SettingsNav/></aside>

            <div className="overflow-x-clip">
                <main className="">{children}</main>
            </div>
        </div>
    );
}
