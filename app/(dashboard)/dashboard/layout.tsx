import { Icon, Icons } from "@/app/components/icons";
import { authOptions } from "@/app/lib/auth";
import { getServerSession, Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";
import SignOutButton from "@/app/components/SignOutButton";
import FriendRequestSidebarOption from "@/app/components/FriendRequestSidebarOption";
import { fetchRedis } from "@/app/helpers/redis";
import { getFriendsByUserId } from "@/app/helpers/get_friends_by_user_id";
import SideBarChatList from "@/app/components/SideBarChatList";

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

const Sidebar: FC<{ session: Session; unseenRequestsCount: number; friends: User[] }> = ({ session, unseenRequestsCount, friends }) => (
  <div className="flex h-full w-full max-w-xs grow flex-col overflow-y-auto border-r border-gray-200 bg-white px-6">
    {/* Logo */}
    <Link href={"/dashboard"} className="flex h-15 shrink-0 items-center">
      <Icons.Logo className="h-8 w-8 text-indigo-600" />
    </Link>

    {/* Chats Section */}
    {friends.length > 0 ? (
      <div className="mt-5 mb-3 px-2">
        <div className="text-xs font-semibold leading-6 text-gray-400">
          your chats
        </div>
      </div>
    ) : null}

    {/* Navigation */}
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-4">
        {/* Placeholder for user chats */}
        <SideBarChatList friends={friends} sessionId={session.user.id} />

        {/* Overview Section */}
        <li>
          <div className="text-xs font-semibold leading-6 text-gray-400">
            overview
          </div>
        </li>

        {/* Sidebar Options */}

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
          <li>
            <FriendRequestSidebarOption
              sessionId={session.user.id}
              initialRequestCount={unseenRequestsCount}
            />
          </li>

        </ul>

        {/* User Profile & Sign Out */}
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
);

const Layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);
  const unseenRequestsCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;
  return (
    <div className="w-full flex h-screen">
      <Sidebar session={session} unseenRequestsCount={unseenRequestsCount} friends={friends} />
      {children}
    </div>
  );
};

export default Layout;
