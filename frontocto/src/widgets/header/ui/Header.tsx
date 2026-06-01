"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavbarSearch } from "..";
import { useAuth } from "@/entities/user";
import { NotificationBell } from "./notification";
import { useEffect, useState } from "react";

export const Header = () => {
  const { token, logout, isLoading } = useAuth();
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter();
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false)
  }, [pathname, token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    router.push("/");
  };

  const toggle = () => {
    setDrawerOpen(!isDrawerOpen)
  }

  if (!mounted) return <header className="sticky top-0 z-50 bg-neutral-800 h-16" />;

  return (
    <header key={token ? 'auth-header' : 'guest-header'} className="sticky top-0 z-50 bg-neutral-800 text-white md:px-8 border-b border-neutral-700">
      <div className="drawer">
        <input
          id="my-drawer-2"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          onChange={toggle}
          data-dashlane-ignore="true"
          data-bitwarden-no-autofill="true"
          data-lpignore="true"
          autoComplete="off"
        ></input>
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="navbar  w-full justify-between">
            <section className="">
              <Link href="/" className="text-lg">
                <Image src={'/img/nacho.png'} height={40} width={40} alt="" ></Image>
              </Link>
            </section>
            <NavbarSearch></NavbarSearch>

            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-6 w-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>
            <div className="hidden flex-none lg:block">
              <section className="md:flex space-x-6 items-center hidden">
                {token && (
                  <>
                    <Link href="/generate" className="hover:underline">
                      Генерация
                    </Link>
                    <details className="dropdown">
                      <summary className="m-1 bg-transparent">Загрузить</summary>
                      <ul className="menu dropdown-content bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                        <li><Link href={"/upload/image"}>Изображение</Link></li>
                        <li><Link href={"/upload/model"}>Модель</Link></li>
                      </ul>
                    </details>
                    <NotificationBell></NotificationBell>
                    <Link href="/user" className="hover:underline">
                      Профиль
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
                        Выйти
                      </button>
                    ) : (
                      <Link href="/auth" className="hover:underline">
                        Войти
                      </Link>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="bg-neutral-800 min-h-full p-4 min-w-1/2">
            {token && (
              <>
                <ul>
                  <li className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                    <Link href="/" className="hover:underline" onClick={toggle}>
                      Главная
                    </Link>
                  </li>
                  <li className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                    {
                      // !!! route to notif page
                    }
                    <NotificationBell></NotificationBell>
                  </li>
                  <li className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                    <Link href="/generate" className="hover:underline" onClick={toggle}>
                      Generate
                    </Link>
                  </li>
                  <li>
                    <details className="dropdown ">
                      <summary className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">Загрузить</summary>
                      <ul className="menu dropdown-bottom bg-neutral-900 rounded-box mt-4 w-52 p-2 shadow-sm">
                        <li><Link href={"/upload/image"} onClick={toggle}>Изображение</Link></li>
                        <li><Link href={"/upload/model"} onClick={toggle}>Модель</Link></li>
                      </ul>
                    </details>
                  </li>
                  <li className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
                    <Link href="/user" className="hover:underline " onClick={toggle}>
                      User
                    </Link>
                  </li>
                </ul>
              </>
            )}
            {!isLoading && (
              <>
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="hover:underline cursor-pointer bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="bg-neutral-900 rounded-box z-1 mt-4 w-52 p-2 shadow-sm text-center">
                    <Link href="/auth" className="hover:underline cursor-pointer" onClick={toggle}>
                      Login
                    </Link></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
