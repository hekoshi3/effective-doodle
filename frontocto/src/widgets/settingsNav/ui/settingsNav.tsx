import Link from "next/link"

export function SettingsNav() {
    return (
        <div className="flex min-h-screen bg-neutral-900">
            <ul className="menu min-h-auto w-3xs bg-neutral-800 border border-r-neutral-700 border-y-0 border-l-0">
                <li><Link href={"/user"} className="py-2 border rounded-[5px] border-neutral-900 bg-neutral-900 hover:bg-[#2D2E30] hover:border-neutral-800 justify-center items-center">In profile</Link></li>
                <li>
                    <h2 className="menu-title text-white">User</h2>
                    <ul className=" text-white">
                        <li className="rounded-[5px] border-neutral-900 bg-neutral-900"><Link href={"/settings/profile"}>Profile</Link></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                    </ul>
                </li>
                <li>
                    <h2 className="menu-title text-white ">System</h2>
                    <ul className=" text-white">
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                    </ul>
                </li>
                <li>
                    <h2 className="menu-title text-white ">Activity</h2>
                    <ul className=" text-white">
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                    </ul>
                </li>
                <li>
                    <h2 className="menu-title text-white">Support</h2>
                    <ul className="">
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                        <li className="menu-disabled rounded-[5px] border-neutral-900 bg-neutral-900 mt-2 hover:rounded-[5px]"><button>reserved</button></li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}