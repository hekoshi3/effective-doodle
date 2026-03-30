"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavbarSearch } from "..";
import { useAuth } from "@/entities/user";
import { NotificationBell } from "./notification";

export const Header = () => {
  const { token, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-800 text-white md:px-8 border-b border-neutral-700">
      <div className="w-full flex justify-between items-center md:px-8 py-1 sm:px-2">
        {/* Left Section */}
        <section className="">
          <Link href="/" className="text-lg">
            <Image src={'/img/nacho.png'} height={40} width={40} alt="" ></Image>
          </Link>
        </section>

        <NavbarSearch></NavbarSearch>

        {/* Right Section */}
        <section className="flex space-x-6 items-center">
          {token && (
            <>
              <Link href="/" className="hover:underline">
                Generate
              </Link>
              <details className="dropdown">
                <summary className="m-1 bg-transparent">Загрузить</summary>
                <ul className="menu dropdown-content bg-neutral-950 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                  <li><Link href={"/upload/image"}>Изображение</Link></li>
                  <li><Link href={"/upload/model"}>Модель</Link></li>
                </ul>
              </details>
              <NotificationBell></NotificationBell>
              <Link href="/user" className="hover:underline">
                User
              </Link>
            </>
          )}
          {!isLoading && (
            <>
              {token ? (
                <button
                  onClick={handleLogout}
                  className="hover:underline cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <Link href="/auth" className="hover:underline">
                  Login
                </Link>
              )}
            </>
          )}
        </section>
      </div>
    </header>
  );
}
