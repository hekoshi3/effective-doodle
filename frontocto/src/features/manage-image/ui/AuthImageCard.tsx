import { ImgCardProps } from "@/entities/AIimage";
import { ImageCard } from "@/entities/AIimage/ui/image-card";
import { useAuth } from "@/entities/user"
import Link from "next/link";

export const AuthImageCard = ({ image, index }: ImgCardProps) => {
    const { user } = useAuth();
    const isOwner = image.author.id === user?.id;

    return (
        <ImageCard image={image}
            statusBadge={isOwner && !image.is_published ?
                <Link
                        href={`/image/edit/${image.id}`} className=""
                    >
                        <div className="flex justify-center p-1 gap-1 items-center bg-yellow-500 text-black text-[10px] font-bold rounded shadow-md uppercase">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="">Draft</span>
                        </div>
                    </Link>
                : <></>} index={index} >
        </ImageCard >
    );
}