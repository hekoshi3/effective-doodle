import Link from "next/link";

export const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-900 flex-col">
            <h1 className=" text-2xl">Упс</h1>
            <p>Запрашиваемый ресурс не обнаружен </p>
            <Link href="/" className="pt-10">{"<"}- На главную</Link>
        </div>
    );
}

export default NotFoundPage;