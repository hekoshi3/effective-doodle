/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

//import "@/app/components/navbar"
import { GalleryImage, BackdendResIMG } from "@/entities/AIimage";
import { Model, BackdendResMODEL } from "@/entities/AImodel";
import { User, useAuth } from "@/entities/user";
import { AuthImageCard } from "@/features/manage-image";
import { AuthModelCard } from "@/features/manage-model";
import { useEffect, useState } from "react";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "/api";

const getDateAfter = (range: string) => {
    if (!range) return "";
    const now = new Date();
    switch (range) {
        case "today": now.setHours(0, 0, 0, 0); break;
        case "week": now.setDate(now.getDate() - 7); break;
        case "month": now.setMonth(now.getMonth() - 1); break;
        case "6months": now.setMonth(now.getMonth() - 6); break;
        case "year": now.setFullYear(now.getFullYear() - 1); break;
        default: return "";
    }
    return now.toISOString();
};

const Select = ({ value, onChange, options = [], placeholder, className = "" }: any) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-neutral-800 text-sm text-neutral-400 p-2 rounded border border-neutral-700 outline-none focus:border-accent ${className}`}
    >
        <option value="">{placeholder}</option>
        {Array.isArray(options) && options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

const DATE_OPTIONS = [
    { value: "today", label: "Сегодня" },
    { value: "week", label: "Эта неделя" },
    { value: "month", label: "Этот месяц" },
    { value: "6months", label: "За 6 месяцев" },
    { value: "year", label: "За год" },
];

const LIKE_OPTIONS = [
    { value: "10", label: "10+ лайков" },
    { value: "50", label: "50+ лайков" },
    { value: "100", label: "100+ лайков" },
    { value: "500", label: "500+ лайков" },
];

export function MainPage() {
    const auth = useAuth();
    const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (url: string, options?: RequestInit) => Promise<Response>;

    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [models, setModels] = useState<Model[]>([]);

    const [feedMode, setFeedMode] = useState<"global" | "following">("global");

    const [modelTypes, setModelTypes] = useState<{ value: string, label: string }[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [availableModels, setAvailableModels] = useState<Model[]>([]);

    const [imgSort, setImgSort] = useState("-created_at");
    const [imgAuthor, setImgAuthor] = useState("");
    const [imgTag, setImgTag] = useState("");
    const [imgMinLikes, setImgMinLikes] = useState("");
    const [imgDateRange, setImgDateRange] = useState("");
    const [imgLinkedModel, setImgLinkedModel] = useState("");

    const [modelSort, setModelSort] = useState("-created_at");
    const [modelAuthor, setModelAuthor] = useState("");
    const [modelTag, setModelTag] = useState("");
    const [modelType, setModelType] = useState("");
    const [modelMinLikes, setModelMinLikes] = useState("");
    const [modelMinDownloads, setModelMinDownloads] = useState("");
    const [modelDateRange, setModelDateRange] = useState("");

    useEffect(() => {
        fetch(`${API_HOST}/config/model-types/`).then(res => res.json()).then(data => setModelTypes(data));
        fetch(`${API_HOST}/users/`).then(res => res.json()).then(data => setUsers(data.results || []));
        fetch(`${API_HOST}/models/`).then(res => res.json()).then(data => setAvailableModels(data.results || []));
    }, []);

    useEffect(() => {
        const fetchGallery = async () => {
            const params = new URLSearchParams({ ordering: imgSort });
            if (feedMode === "following") params.append("feed", "following");
            if (imgAuthor) params.append("author", imgAuthor);
            if (imgTag) params.append("tag", imgTag);
            if (imgMinLikes) params.append("min_likes", imgMinLikes);
            if (imgLinkedModel) params.append("linked_model", imgLinkedModel);

            const dateAfter = getDateAfter(imgDateRange);
            if (dateAfter) params.append("created_after", dateAfter);

            try {
                const url = `${API_HOST}/images/?${params.toString()}`;
                const res = auth.token && !auth.isLoading ? await makeAuthenticatedRequest(url) : await fetch(url);
                const data: BackdendResIMG = await res.json();
                setGallery(data?.results?.filter(img => img.is_published) || []);
            } catch (e) { console.error(e); }
        };
        if (!auth.isLoading) fetchGallery();
    }, [auth.token, auth.isLoading, feedMode, imgSort, imgAuthor, imgTag, imgMinLikes, imgDateRange, imgLinkedModel, makeAuthenticatedRequest]);

    useEffect(() => {
        const fetchModels = async () => {
            const params = new URLSearchParams({ ordering: modelSort });
            if (feedMode === "following") params.append("feed", "following");
            if (modelAuthor) params.append("author", modelAuthor);
            if (modelTag) params.append("tag", modelTag);
            if (modelType) params.append("model_type", modelType);
            if (modelMinLikes) params.append("min_likes", modelMinLikes);
            if (modelMinDownloads) params.append("min_downloads", modelMinDownloads);

            const dateAfter = getDateAfter(modelDateRange);
            if (dateAfter) params.append("created_after", dateAfter);

            try {
                const url = `${API_HOST}/models/?${params.toString()}`;
                const res = auth.token && !auth.isLoading ? await makeAuthenticatedRequest(url) : await fetch(url);
                const data: BackdendResMODEL = await res.json();
                setModels(data?.results?.filter(m => m.is_published) || []);
            } catch (e) { console.error(e); }
        };
        if (!auth.isLoading) fetchModels();
    }, [auth.token, auth.isLoading, feedMode, modelSort, modelAuthor, modelTag, modelType, modelMinLikes, modelMinDownloads, modelDateRange, makeAuthenticatedRequest]);

    return (
        <main className="bg-neutral-900 min-h-screen p-4 sm:p-8 text-white">
            <div className="absolute right-0 left-0 top-20 flex justify-center mb-10">
                <div className="inline-flex bg-neutral-800 p-1 rounded-xl border border-neutral-700 shadow-lg">
                    <button
                        onClick={() => setFeedMode("global")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${feedMode === "global" ? 'bg-accent text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Общая
                    </button>
                    <button
                        onClick={() => {
                            if (!auth.token) {
                                alert("Для просмотра ленты подписок нужно войти в аккаунт");
                                return;
                            }
                            setFeedMode("following");
                        }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${feedMode === "following" ? 'bg-accent text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Подписки
                    </button>
                </div>
            </div>

            <section className="mb-16">
                <div className="flex flex-col gap-4 mt-15 md:mt-0 mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter">
                        {feedMode === "following" ? "Изображения из подписок" : "Изображения"}
                    </h1>
                    <div className="flex flex-wrap gap-2 items-center bg-neutral-800/30 p-3 rounded-lg border border-neutral-800">
                        {feedMode === "global" && (
                            <Select
                                value={imgAuthor}
                                onChange={setImgAuthor}
                                placeholder="Пользователь"
                                options={users.map(u => ({ value: u.id.toString(), label: u.username }))}
                            />
                        )}
                        <Select
                            value={imgLinkedModel}
                            onChange={setImgLinkedModel}
                            placeholder="Модель"
                            options={availableModels.map(m => ({ value: m.id.toString(), label: m.name }))}
                        />
                        <input
                            type="text"
                            value={imgTag}
                            onChange={(e) => setImgTag(e.target.value)}
                            placeholder="Введите тэг..." // !!! tag autocomplete
                            className="bg-neutral-800 text-sm p-2 rounded border border-neutral-700 w-32 outline-none focus:border-accent"
                            autoComplete="off"
                        />
                        <Select value={imgMinLikes} onChange={setImgMinLikes} placeholder="Лайки" options={LIKE_OPTIONS} />
                        <Select value={imgDateRange} onChange={setImgDateRange} placeholder="Время" options={DATE_OPTIONS} />
                        <Select
                            value={imgSort}
                            onChange={setImgSort}
                            placeholder="Сортировка"
                            options={[
                                { value: "-created_at", label: "Новое" },
                                { value: "-likes_count", label: "Популярное" },
                            ]}
                        />
                    </div>
                </div>
                {gallery.length === 0 && !auth.isLoading ? (
                    <div className="text-center py-20 text-neutral-500 italic">Не найдено изображений по текущему запросу.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {gallery.slice(0,10).map((img, i) => <AuthImageCard key={img.id} image={img} index={i} />)}
                    </div>
                )}
            </section>

            <section>
                <div className="flex flex-col gap-4 mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter">
                        {feedMode === "following" ? "Модели из подписок" : "Модели"}
                    </h1>
                    <div className="flex flex-wrap gap-2 items-center bg-neutral-800/30 p-3 rounded-lg border border-neutral-800">
                        <Select value={modelType} onChange={setModelType} placeholder="Тип" options={modelTypes} />
                        {feedMode === "global" && (
                            <Select
                                value={modelAuthor}
                                onChange={setModelAuthor}
                                placeholder="Пользователь"
                                options={users.map(u => ({ value: u.id.toString(), label: u.username }))}
                            />
                        )}
                        <input
                            type="text"
                            value={modelTag}
                            onChange={(e) => setModelTag(e.target.value)}
                            placeholder="Введите тэг..."
                            className="bg-neutral-800 text-sm p-2 rounded border border-neutral-700 w-32 outline-none focus:border-accent"
                            autoComplete="off"
                        />
                        <Select value={modelMinLikes} onChange={setModelMinLikes} placeholder="Лайки" options={LIKE_OPTIONS} />
                        <Select value={modelMinDownloads} onChange={setModelMinDownloads} placeholder="Скачивания" options={[{ value: "50", label: "50+ DL" }, { value: "200", label: "200+ DL" }, { value: "1000", label: "1000+ DL" }]} />
                        <Select value={modelDateRange} onChange={setModelDateRange} placeholder="Время" options={DATE_OPTIONS} />
                        <Select
                            value={modelSort}
                            onChange={setModelSort}
                            placeholder="Sort"
                            options={[
                                { value: "-created_at", label: "Недавние" },
                                { value: "-downloads_count", label: "По загрузкам" },
                                { value: "-likes_count", label: "По лайкам" },
                                { value: "-rating", label: "По рейтингу" },
                            ]}
                        />
                    </div>
                </div>
                {models.length === 0 && !auth.isLoading ? (
                    <div className="text-center py-20 text-neutral-500 italic">Не найдено моделей по текущему запросу.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {models.slice(0, 10).map((model, i) => <AuthModelCard key={model.id} model={model} index={i} />)}
                    </div>
                )}
            </section>
        </main>
    );
}