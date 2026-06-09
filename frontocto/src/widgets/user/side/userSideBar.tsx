import { userSideProps } from "@/entities/user";
import Image from "next/image";
import Link from "next/link";

export const UserSidebar = (
    { userProfile,
        displayCount,
        displayFollow,
        toggleFollow,
        auth,
        isOwnProfile,
        isUpdatingFollow }: userSideProps
) => {
    const avatar = userProfile.profile.avatar
    const username = userProfile.username
    const bio = userProfile.profile.bio
    return (
        <>
            <div className="w-full pr-4 lg:w-96 bg-neutral-900 border-l border-neutral-800">
                <div className="w-full flex flex-col items-center justify-center pt-10 px-4">
                    <div className="relative">
                        {/* !!! */}
                        <Image src={avatar || "/img/nacho.png"} width={512} height={512} alt={username} loading="eager" preload={true} className="rounded-full h-32 w-32 object-cover border-4 border-neutral-800" />
                    </div>
                    <p className="text-2xl font-mono mt-4 text-white">{userProfile.username}</p>
                    <p className="text-sm font-extralight text-neutral-400 mt-2">{displayCount} подписчиков</p>

                    {auth.token && !isOwnProfile && (
                        <button
                            onClick={toggleFollow}
                            disabled={isUpdatingFollow}
                            className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${displayFollow ? "bg-neutral-700 hover:bg-neutral-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                            {isUpdatingFollow ? "..." : displayFollow ? "Отписаться" : "Подписаться"}
                        </button>
                    )}

                    <div className="relative z-20 flex justify-between pt-4 ">
                        {auth.token && isOwnProfile && (
                            <Link href={`/settings`} className="btn bg-neutral-900 rounded-xl font-light opacity-80 hover:opacity-100 hover:bg-neutral-800 transition-opacity">
                                Настройки
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                        <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                            <p className="text-xl font-bold text-white">{userProfile.stats.total_likes}</p>
                            <p className="text-[10px] uppercase text-neutral-500">Лайков</p>
                        </div>
                        <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                            <p className="text-xl font-bold text-white">{userProfile.stats.total_downloads}</p>
                            <p className="text-[10px] uppercase text-neutral-500">Загрузок</p>
                        </div>
                        <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                            <p className="text-xl font-bold text-white">{userProfile.stats.images_count}</p>
                            <p className="text-[10px] uppercase text-neutral-500">Изображений</p>
                        </div>
                        <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                            <p className="text-xl font-bold text-white">{userProfile.stats.models_count}</p>
                            <p className="text-[10px] uppercase text-neutral-500">Моделей</p>
                        </div>
                    </div>


                    <p className="mt-3 text-sm text-ellipsis min-w-full max-w-full max-h-110 whitespace-pre-wrap wrap-break-word truncate bg-neutral-800/40 rounded-xl p-2">{bio}</p>
                </div>
            </div>
        </>
    )
}