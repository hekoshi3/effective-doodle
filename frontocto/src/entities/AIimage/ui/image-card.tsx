import { ImgCardProps } from "../";

import Image from "next/image"
import Link from "next/link";

export const ImageCard = ({ image, actionSlot, statusBadge, index = 0 }: ImgCardProps) => {
    return (
        <div key={index} className="relative group bg-neutral-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:scale-[1]">

            <Link href={`/image/${image.id}`} className="block relative w-full aspect-2/3">
                <Image
                    src={image.image}
                    alt={"Image" + image.id}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index < 4}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-transparent to-black/40 opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-start z-20">
                <div>
                    {statusBadge}
                </div>

                <div className="flex gap-2">
                    {actionSlot}
                </div>
            </div>

            <div className="absolute top-0 right-0 p-3 dropdown dropdown-end">
                <div tabIndex={0} role="button" className="bg-black/40 hover:bg-black/60 cursor-pointer rounded-lg p-2 backdrop-blur-md transition-all">
                    <Image src="/menu-white.svg" alt="Menu" width={18} height={18} />
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-neutral-900 border border-neutral-700 rounded-xl z-[30] p-2 mt-2 shadow-2xl w-56 text-[11px]">
                    <li className="menu-title text-neutral-500 text-[10px] uppercase">Generation Info</li>
                    <li className="truncate text-neutral-300"><span>Model: {image.linked_model || "N/A"}</span></li>
                    <li className="truncate text-neutral-300"><span>Sampler: {image.generation_params.sampler || "N/A"}</span></li>
                    <li className="truncate text-neutral-300"><span>Seed: {image.generation_params.seed || "N/A"}</span></li>
                    <li className="truncate text-neutral-300"><span>Size: {image.generation_params.width}x{image.generation_params.height}</span></li>
                </ul>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="flex items-center justify-between">
                    <Link href={`/user/${image.author.username}`} className="flex items-center gap-2 group/author max-w-[65%]">
                        <div className="relative w-8 h-8 shrink-0">
                            <Image
                                src={image.author.profile?.avatar || "/img/nacho.png"}
                                alt={ image.author.username || "Anonimous"}
                                fill
                                className="rounded-full border border-white/20 object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover/author:text-accent transition-colors">
                                { image.author.username  }
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate">
                                {image.author.followers_count} followers
                            </p>
                        </div>
                    </Link>

                    {/*<button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${displayLiked
                                ? 'bg-accent text-black font-bold scale-105'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        onClick={handleLikeClick}
                        disabled={isUpdating || auth.isLoading || !auth.token}
                    >
                        <Image
                            src={displayLiked ? "/heart-full-white.svg" : "/heart-white.svg"}
                            alt="Like"
                            width={14}
                            height={14}
                            className={displayLiked ? "invert" : ""}
                        />
                        <span className="text-xs">{displayCount}</span>
                    </button>*/}
                </div>
            </div>
        </div>
    )
};