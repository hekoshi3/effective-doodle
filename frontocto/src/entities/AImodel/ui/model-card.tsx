import { ModelCardProps } from "../types";

import Image from "next/image"
import Link from "next/link";

export const ModelCard = ({ model, actionSlot, statusBadge, index = 0 }: ModelCardProps) => {
    return (
        <div key={index} className="relative group bg-neutral-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:scale-[1.01]">

            <Link href={`/model/${model.id}`} className="block relative w-full aspect-2/3">
                <Image
                    src={model.featured_image_url || "/image404.png"}
                    alt={model.name || "Model"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index < 4}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-transparent to-black/40 opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-20">
                <div>
                    {statusBadge}
                    {model.model_type && (
                        <div className="mt-1 bg-accent/90 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            {model.model_type}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">                  
                    {actionSlot}
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="mb-3">
                    <h4 className="text-lg font-bold text-white truncate leading-tight group-hover:text-accent transition-colors">
                        {model.name || "Untitled Model"}
                    </h4>
                </div>

                <div className="flex items-center justify-between">
                    <Link href={`/user/${model.author.username}`} className="flex items-center gap-2 group/author max-w-[65%]">
                        <div className="relative w-7 h-7 shrink-0">
                            <Image
                                /* !!! there should be url from user profile, but with refactroing, we did authorId instead of whole Author instance. 
                                should implement parse after or refactr this part with more optimised solution /// 
                                // !!! upd: we still need to make proper parser after refactor, mb with Zog */
                                src={model.author.profile.avatar || "/img/nacho.png"}
                                alt={model.author.username}
                                fill
                                className="rounded-full border border-white/20 object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover/author:text-accent transition-colors">
                                { model.author.username  }
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate">
                                {model.author.followers_count} followers
                            </p>
                        </div>
                    </Link>

                    {/*<button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${displayLiked
                            ? 'bg-accent text-black font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        onClick={handleLikeClick}
                        disabled={isUpdating || auth.isLoading || !auth.token}
                    >
                        <Image
                            src={displayLiked ? "/heart-full-white.svg" : "/heart-white.svg"}
                            alt="Like"
                            width={13}
                            height={13}
                            className={displayLiked ? "invert" : ""}
                        />
                        <span className="text-xs">{displayCount}</span>
                    </button>*/}
                </div>
            </div>
        </div>
    )
};