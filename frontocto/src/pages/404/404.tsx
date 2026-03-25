import Link from "next/link";

export const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-900 flex-col">
            <h1 className=" text-2xl">Oops</h1>
            <p>The requested page does not exist </p>
            <Link href="/" className="pt-10">{"<"}- Go home</Link>
        </div>
    );
}

export default NotFoundPage;