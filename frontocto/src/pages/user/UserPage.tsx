"use client";

import { SetStateAction, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useAuth, Analytics } from "@/entities/user";
import { AuthImageCard } from "@/features/manage-image";
import { AuthModelCard } from "@/features/manage-model";
import { useUserPageData } from "@/entities/user";
import { useToggleFollow } from "@/features/user";
import { UserSidebar } from "@/widgets/user";

export function UserPage() {
    const params = useParams();
    const username = params?.name as string;
    const auth = useAuth();

    const [activeTab, setActiveTab] = useState<"images" | "models" | "analytics">("images");

    const {
        userProfile,
        currentUserProfile,
        analytics,
        gallery,
        models,
        isLoading,
        error,
        isOwnProfile,
    } = useUserPageData(username, auth)

    const {
        displayFollow,
        displayCount,
        isUpdatingFollow,
        toggleFollow,
    } = useToggleFollow(userProfile, auth)

    

    if (isLoading) {
        return (
            <main className="flex w-screen items-center justify-center min-h-screen bg-neutral-900">
                <div className="text-white text-xl"><span className="loading loading-ring loading-xl"></span></div>
            </main>
        );
    }

    if (error || !userProfile) {
        return (
            <main className="flex w-screen items-center justify-center min-h-screen bg-neutral-900">
                <div className="text-red-100 text-xl">{"User not found"}</div>
                <Link href="/" className="ml-4 text-blue-400 hover:underline">Go back</Link>
            </main>
        );
    }


    return (
        <main className="flex w-screen min-h-screen bg-neutral-900 text-neutral-200">
            <div className="flex w-full flex-col"> {/* bg-[url(/img/nachosmile.jpg)] */}
                <div className="h-80 border-b border-neutral-950 relative">
                    <div className="justify-center items-center">
                        {userProfile.profile.banner ? <Image
                            src={userProfile.profile.banner}
                            alt="Profile banner"
                            className="max-h-79 object-cover"
                            height={512}
                            width={1920}
                            loading={"lazy"}>
                        </Image> :
                            <Image
                                src="/img/nachosmile.jpg"
                                alt="Profile banner"
                                className="max-h-79 object-cover"
                                height={320}
                                width={1920}
                                loading={"lazy"}>
                            </Image>}
                    </div>
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-neutral-900"></div>
                </div>

                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 overflow-y-auto pt-4 pl-4 pr-4 lg:pr-8">
                        <div className="flex gap-4 mb-6 border-b border-neutral-800">
                            {["images", "models", "analytics"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as SetStateAction<"images" | "models" | "analytics">)}
                                    className={`pb-2 px-4 font-semibold transition-colors capitalize ${activeTab === tab ? "text-white border-b-2 border-blue-500" : "text-neutral-400 hover:text-white"
                                        }`}
                                >
                                    {tab} {tab === "images" && `(${gallery.length})`} {tab === "models" && `(${models.length})`}
                                </button>
                            ))}
                        </div>

                        {activeTab === "images" && (
                            gallery.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                    {gallery.map((img, index) => <AuthImageCard key={img.id ?? index} image={img} index={index} />)}
                                </div>
                            ) : <div className="flex items-center justify-center h-64 text-neutral-400">No images yet</div>
                        )}

                        {activeTab === "models" && (
                            models.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                    {models.map((model, index) => <AuthModelCard key={model.id ?? index} model={model} index={index} />)}
                                </div>
                            ) : <div className="flex items-center justify-center h-64 text-neutral-400">No models yet</div>
                        )}

                        {activeTab === "analytics" && (
                            <div className="space-y-8 pb-10">
                                {analytics ? (
                                    <>
                                        <ActivityGraph data={analytics.activity_graph} />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                                    Популярные модели
                                                </h3>
                                                <div className="space-y-3">
                                                    {analytics.top_models.map(m => (
                                                        <div key={m.id} className="flex justify-between items-center bg-neutral-900/50 p-3 rounded-lg">
                                                            <Link href={"/model/" + m.id} className="text-sm truncate max-w-37.5">{m.name}</Link>
                                                            <div className="flex gap-3 text-xs">
                                                                <span className="text-blue-400">⬇ {m.downloads_count}</span>
                                                                <span className="text-pink-400">❤ {m.likes_count}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                                    Топ изображений
                                                </h3>
                                                <div className="space-y-3">
                                                    {analytics.top_images.map(img => (
                                                        <div key={img.id} className="flex justify-between items-center bg-neutral-900/50 p-3 rounded-lg">
                                                            <Link href={"/image/" + img.id} className="text-sm text-neutral-500">ID: {img.id}</Link>
                                                            <span className="text-pink-400 text-xs font-bold">❤ {img.likes_count} лайков</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-500">
                                        <p>Аналитика для этого пользователя пока недоступна</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <UserSidebar
                        userProfile={userProfile}
                        displayCount={displayCount}
                        displayFollow={displayFollow}
                        toggleFollow={toggleFollow}
                        auth={auth}
                        isOwnProfile={isOwnProfile}
                        isUpdatingFollow={isUpdatingFollow}
                        currentUserProfile={currentUserProfile}>
                    </UserSidebar>
                </div>
            </div>
        </main>
    );
}

const ActivityGraph = ({ data }: { data: Analytics['activity_graph'] }) => {
        if (!data) return <p className="text-neutral-500">Нет данных для графика</p>;
        const maxCount = Math.max(...data.map(d => d.count), 1);
        const height = 100;
        const width = 400;
        const step = width / (data.length - 1 || 1);

        const points = data.map((d, i) => `${i * step},${height - (d.count / maxCount) * height}`).join(' ');

        return (
            <div className="w-full bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-semibold mb-4 text-neutral-300 uppercase tracking-wider">Активность за последнее время</h3>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        points={points}
                    />
                    {data.map((d, i) => (
                        <circle key={i} cx={i * step} cy={height - (d.count / maxCount) * height} r="3" fill="#3b82f6" className="hover:r-4 transition-all cursor-pointer" />
                    ))}
                </svg>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-500">
                    <span>{data[0].date ? data[0].date : "n/a"}</span>
                    <span>{data[data.length - 1].date ? data[data.length - 1].date : "n/a"}</span>
                </div>
            </div>
        );
    };