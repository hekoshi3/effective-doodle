import { userSideProps } from "@/entities/user";
import Image from "next/image";
import Link from "next/link";

export const UserSidebar = (
    {userProfile,
    displayCount,
    displayFollow,
    toggleFollow,
    auth,
    isOwnProfile,
    isUpdatingFollow,
    currentUserProfile}: userSideProps
) => {
    const avatar = userProfile.profile.avatar
    const username = userProfile.username
    return (
        <>
            <div className="w-full pr-4 lg:w-96 bg-neutral-900 border-l border-neutral-800">
                <div className="w-full flex flex-col items-center justify-center pt-10 px-4">
                    <div className="relative">
                        {/* !!! */}
                        <Image src={avatar || "/img/nacho.png"} width={128} height={128} alt={username} loading="eager" preload={true} className="rounded-full h-32 w-32 object-cover border-4 border-neutral-800" />
                    </div>
                    <p className="text-2xl font-mono mt-4 text-white">{userProfile.username}</p>
                    {userProfile.bio && <p className="text-sm text-neutral-300 mt-2 text-center max-w-xs">{userProfile.bio}</p>}
                    <p className="text-sm font-extralight text-neutral-400 mt-2">{displayCount} подписчиков</p>

                    {auth.token && !isOwnProfile && (
                        <button
                            onClick={toggleFollow}
                            disabled={isUpdatingFollow}
                            className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${displayFollow ? "bg-neutral-700 hover:bg-neutral-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                            {isUpdatingFollow ? "..." : displayFollow ? "Unfollow" : "Follow"}
                        </button>
                    )} 

                    <div className="relative z-20 flex justify-between pt-4 ">
                        {auth.token && isOwnProfile && (
                            <Link href={`/settings`} className="btn bg-neutral-900 rounded-xl font-light opacity-80 hover:opacity-100 hover:bg-neutral-800 transition-opacity">
                                Редактировать
                            </Link>
                        )}
                    </div>

                    {currentUserProfile && (
                        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                            <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-white">{currentUserProfile.stats.total_likes}</p>
                                <p className="text-[10px] uppercase text-neutral-500">Лайков</p>
                            </div>
                            <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-white">{currentUserProfile.stats.total_downloads}</p>
                                <p className="text-[10px] uppercase text-neutral-500">Загрузок</p>
                            </div>
                            <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-white">{currentUserProfile.stats.images_count}</p>
                                <p className="text-[10px] uppercase text-neutral-500">Изображений</p>
                            </div>
                            <div className="bg-neutral-800/40 p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-white">{currentUserProfile.stats.models_count}</p>
                                <p className="text-[10px] uppercase text-neutral-500">Моделей</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}