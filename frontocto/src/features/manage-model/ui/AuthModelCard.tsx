import { ModelCardProps, ModelCard } from "@/entities/AImodel";
import { useAuth } from "@/entities/user"
import Link from "next/link";

export const AuthModelCard = ({ model, index }: ModelCardProps) => {
    const { user } = useAuth();
    console.log(model.author.id)
    const isOwner = model.author.id === user?.id;


    return (
        <ModelCard model={model} statusBadge={isOwner && !model.is_published ?
            <Link
                href={`/model/edit/${model.id}`}
            >
                <div className="flex justify-center items-center bg-yellow-500 hover:bg-yellow-800 text-black text-[10px] font-bold py-1 rounded shadow-md uppercase">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Draft</span>
                </div>
            </Link>
            : <></>} index={index}>
        </ModelCard>
    );
}