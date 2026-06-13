"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GalleryImage } from "@/entities/AIimage";
import { CommentList, Comment } from "@/entities/comment";
import { useAuth } from "@/entities/user";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "/api";

export function ImageDetailPage() {
    const params = useParams();
    const router = useRouter();
    const imageId = params?.id as string;

    const [image, setImage] = useState<GalleryImage | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [tags, setTags] = useState<string[]>([]);

    const auth = useAuth();
    const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (url: string, options?: RequestInit) => Promise<Response>;

    const isAuthor = auth.user && image && auth.user.username === image.author.username;

    const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
    const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
    const [isUpdatingLike, setIsUpdatingLike] = useState<boolean>(false);
    const pendingLikeRef = useRef<boolean | null>(null);

    useEffect(() => {
        if (!imageId || auth.isLoading) return;

        const fetchImageData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const imageRes = auth.token
                    ? await makeAuthenticatedRequest(`${API_HOST}/images/${imageId}/`)
                    : await fetch(`${API_HOST}/images/${imageId}/`);

                if (!imageRes.ok) throw new Error("Произошла ошибка");

                const imageData: GalleryImage = await imageRes.json();
                setImage(imageData);

                if (Array.isArray(imageData.tags)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setTags(imageData.tags.map((t: any) => typeof t === "string" ? t : t.name));
                }

                const commentsRes = auth.token
                    ? await makeAuthenticatedRequest(`${API_HOST}/comments/?image=${imageId}`)
                    : await fetch(`${API_HOST}/comments/?image=${imageId}`);

                if (commentsRes.ok) {
                    const commentsData: CommentList = await commentsRes.json();
                    setComments(commentsData.results || []);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || "Произошла ошибка при загрузке изображения");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageId, auth.token, auth.isLoading]);

    useEffect(() => {
        if (!image || auth.isLoading || !auth.token) return;
        setOptimisticLiked(prev => (prev !== null && image.is_liked === prev) ? null : prev);
        setOptimisticCount(prev => (prev !== null && image.likes_count === prev) ? null : prev);
    }, [image?.is_liked, image?.likes_count, auth.isLoading, auth.token, image]);

    const displayLiked = pendingLikeRef.current !== null ?
        pendingLikeRef.current : (optimisticLiked !== null ?
            optimisticLiked : (image?.is_liked ?? false));
    const displayCount = optimisticCount !== null ?
        optimisticCount : (image?.likes_count ?? 0);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!auth.token || isUpdatingLike || auth.isLoading || !image) return;
        const currentCount = displayCount;
        const nextLiked = !displayLiked;
        pendingLikeRef.current = nextLiked;
        setIsUpdatingLike(true);
        setOptimisticLiked(nextLiked);
        setOptimisticCount(nextLiked ? currentCount + 1 : Math.max(currentCount - 1, 0));

        makeAuthenticatedRequest(`${API_HOST}/likes/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: image.id, aimodel: null }),
        }).finally(() => {
            setTimeout(() => {
                pendingLikeRef.current = null;
                setIsUpdatingLike(false);
            }, 200);
        });
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.token || !commentText.trim() || isSubmittingComment || !image) return;
        setIsSubmittingComment(true);
        try {
            const response = await makeAuthenticatedRequest(`${API_HOST}/comments/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: image.id, text: commentText.trim() }),
            });
            if (response.ok) {
                const newComment: Comment = await response.json();
                setComments(prev => [newComment, ...prev]);
                setCommentText("");
            }
        } catch (error) { console.error(error); } finally { setIsSubmittingComment(false); }
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric", month: "long", day: "numeric"
        });
    };

    if (isLoading) return <main className="flex w-screen items-center justify-center min-h-screen bg-neutral-900"><span className="loading loading-ring loading-xl text-white"></span></main>;
    if (error || !image || (!isAuthor && !image.is_published)) return <main className="flex w-screen flex-col items-center justify-center min-h-screen bg-neutral-900 text-white"><p className="text-xl">{"Запрашиваемый ресурс не найден"}</p><Link href="/" className="mt-4 text-accent hover:underline">На главную</Link></main>;
    return (
        <main className="bg-neutral-900 min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <button onClick={() => router.back()} className="mb-6 text-neutral-400 hover:text-white transition-colors flex items-center gap-2">← Назад</button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-6">
                        <div className="relative w-full aspect-square bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl">
                            <Image
                                src={image.image}
                                alt={`Изображение ${image.id}`}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        {image.linked_model.id ?
                            <div className="p-2 border-b border-neutral-700">
                                <span className="text-[10px] uppercase font-bold text-neutral-500 px-2">Связанная модель</span>
                                <Link
                                    key={`m-${image.linked_model}`}
                                    href={`/model/${image.linked_model.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-neutral-700 rounded-lg transition-colors group"
                                >
                                    <div className="relative w-10 h-10 shrink-0 bg-neutral-900 rounded overflow-hidden">
                                        <Image src={image.linked_model.image || "/image404.png"} alt="" fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate group-hover:text-accent">{image.linked_model.name}</div>
                                        <div className="text-[10px] text-neutral-500">{image.linked_model.type} • @{image.linked_model.authorName /* !!! */}</div>
                                    </div>
                                </Link>
                            </div> : <></>}
                    </div>  

                    <div className="flex flex-col gap-8">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {!image.is_published && (
                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold uppercase">Черновик</span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-white leading-tight">Изображение #{image.id}</h1>
                            </div>
                            {isAuthor && (
                                <Link
                                    href={`/image/edit/${image.id}`}
                                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Редактировать
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
                            <Link href={`/user/${image.author.username}`} className="flex items-center gap-4 group">
                                <Image
                                    src={image.author.profile?.avatar || "/img/nacho.png"}
                                    alt={image.author.username}
                                    width={128} height={128}
                                    className="rounded-full border-2 h-14 w-14 object-cover border-neutral-600 group-hover:border-accent transition-all"
                                />
                                <div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-accent transition-colors">@{image.author.username}</h2>
                                    <p className="text-sm text-neutral-400">{image.author.followers_count} подписчиков</p>
                                </div>
                            </Link>
                        </div>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-md text-sm border border-neutral-700">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {image.description && (
                            <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
                                <h3 className="text-sm uppercase tracking-widest text-neutral-500 font-bold mb-4">Description</h3>
                                <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                    {image.description}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isUpdatingLike || auth.isLoading || !auth.token}
                                    className={`flex items-center gap-2 transition-all ${displayLiked ? 'text-accent scale-110' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    <Image src={displayLiked ? "/heart-full-white.svg" : "/heart-white.svg"} alt="Like" width={24} height={24} />
                                    <span className="text-xl font-bold">{displayCount}</span>
                                </button>
                            </div>
                            <span className="text-neutral-500 text-xs font-mono uppercase">{formatDate(image.created_at)}</span>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h3 className="text-sm uppercase tracking-widest text-neutral-500 font-bold mb-6">Параметры генерации</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                {[
                                    { label: "Model", value: image.generation_params?.model ?? "" },
                                    { label: "Sampler", value: image.generation_params?.sampler ?? "" },
                                    { label: "Scheduler", value: image.generation_params?.schedule_type ?? "" },
                                    { label: "Seed", value: image.generation_params?.seed ?? "" },
                                    { label: "Steps", value: image.generation_params?.steps ?? "" },
                                    { label: "CFG Scale", value: image.generation_params?.cfg_scale ?? "" },
                                    { label: "Resolution", value: `${image.generation_params?.width ?? ""} × ${image.generation_params?.height ?? ""}` },
                                ].map((item, i) => item.value && (
                                    <div key={i} className="flex flex-col border-l-2 border-neutral-700 pl-3">
                                        <span className="text-neutral-500 text-[10px] uppercase font-bold">{item.label}</span>
                                        <span className="text-neutral-200 font-mono truncate">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {image.generation_params?.prompt && (
                                <div className="mt-8 pt-6 border-t border-neutral-700">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold">Prompt</span>
                                    <div className="mt-2 p-3 bg-neutral-900/50 rounded-lg text-sm text-neutral-200 leading-relaxed wrap-break-word whitespace-pre-wrap font-mono">
                                        {image.generation_params.prompt}
                                    </div>
                                </div>
                            )}

                            {image.generation_params?.negative_prompt && (
                                <div className="mt-4">
                                    <span className="text-[10px] uppercase font-bold text-red-400/60">Negative Prompt</span>
                                    <div className="mt-2 p-3 bg-neutral-900/50 rounded-lg text-sm text-neutral-400 leading-relaxed wrap-break-word whitespace-pre-wrap font-mono border border-red-900/10">
                                        {image.generation_params.negative_prompt}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 border-t border-neutral-800 pt-10">
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                Комментарии <span className="text-sm bg-neutral-800 px-3 py-1 rounded-full text-neutral-500">{comments.length}</span>
                            </h3>

                            {auth.token ? (
                                <form onSubmit={handleSubmitComment} className="mb-10 group">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Введите комментарий..."
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl p-4 min-h-25 focus:border-accent outline-none transition-all"
                                        disabled={isSubmittingComment}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim() || isSubmittingComment}
                                            className="bg-neutral-200 text-black px-6 py-2 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingComment ? "Отправка..." : "Отправить"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-neutral-800/50 border border-neutral-700 border-dashed p-6 rounded-xl text-center mb-8">
                                    <p className="text-neutral-400 text-sm"><Link href="/auth" className="text-accent hover:underline">Войдите</Link>, чтобы прокомментировать</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-10 italic">Ещё ничего нет. Станьте первым!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <Image
                                                src={comment.author.profile?.avatar || "/img/nacho.png"}
                                                alt={comment.author.username}
                                                width={40} height={40}
                                                className="rounded-full shrink-0 h-10 w-10 border border-neutral-700"
                                            />
                                            <div className="flex-1 bg-neutral-800/30 p-4 rounded-2xl border border-neutral-700/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-white text-sm">@{comment.author.username}</span>
                                                    <span className="text-[10px] text-neutral-500 uppercase">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-neutral-300 text-sm leading-relaxed wrap-break-word">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}