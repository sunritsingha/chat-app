import { Icon, Icons } from "@/app/components/icons";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";
import SignOutButton from "@/app/components/SignOutButton";

interface LayoutProps {
    children: ReactNode;
}

interface SideBarOptions {
    id: number;
    name: string;
    href: string;
    Icon: Icon;
}

const sideBarOptions: SideBarOptions[] = [
    { id: 1, name: "Add Friend", href: "/dashboard/add", Icon: "UserPlus" },
];

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        notFound();
    }
    return (
        <div className="w-full flex h-screen">
            <div className="flex h-full w-full max-w-xs grow flex-col overflow-y-auto border-r border-gray-200 bg-white px-6">
                {/* Sidebar */}
                <Link href={"/dashboard"} className="flex h-15 shrink-0 items-center">
                    <Icons.Logo className="h-8 w-8 text-indigo-600" />
                </Link>
                <div className="text-xs font-semibold leading-6 text-gray-500 mt-6 mb-4">
                    your chats
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-4">
                        <li>//chats that the user has</li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                                overview
                            </div>
                        </li>
                        <ul role="list" className="-mx-2 space-y-0.5">
                            {sideBarOptions.map((options) => {
                                const Icon = Icons[options.Icon];
                                return (
                                    <li key={options.id}>
                                        <Link
                                            href={options.href}
                                            className="text-gray-700 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:bg-gray-50 hover:text-indigo-600"
                                        >
                                            <span className="text-gray-400 group-hover:text-indigo-600 flex shrink-0 items-center justify-center rounded-large text-[0.625rem] font-medium bg-white">
                                                {Icon && <Icon className="h-5 w-5" />}
                                            </span>
                                            <span className="truncate">{options.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        <li className="-mx-6 mt-auto flex items-center justify-between py-4">
                            <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                                <div className="relative h-8 w-8 bg-gray-50"> 
                                    <Image
                                        fill
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                        src={session.user.image || ""}
                                        alt="Your profile picture"
                                    />
                                </div>
                                <span className="sr-only">Your profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden="true">{session.user.name}</span>
                                    <span className="text-xs text-zinc-400" aria-hidden="true">
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                            <SignOutButton className="h-full aspect-square" />
                        </li>
                    </ul>
                </nav>
            </div>
            {children}
        </div>
    );
};

export default Layout;
