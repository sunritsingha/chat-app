"use client";
import { FC, Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Link from "next/link";
import Button, { ButtonVariants } from "./ui/Button";
import { Icons } from "./icons";
import { Menu, X } from "lucide-react";
import SignOutButton from "./SignOutButton";
import Image from "next/image";
import FriendRequestSidebarOption from "./FriendRequestSidebarOption";
import SideBarChatList from "./SideBarChatList";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
interface MobileChatLayoutProps {
  friends: User[];
  unseenRequestCount: number;
  session: Session;
  sidebaroptions: SideBarOptions[];
}

const MobileChatLayout: FC<MobileChatLayoutProps> = ({friends, unseenRequestCount, session, sidebaroptions}) => {
  const [open, setOpen] = useState<boolean>(false);
  const pathName = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathName]);
  // Detect if on a chat page and extract chat partner info
  const isChatPage = !!pathName && pathName.startsWith('/dashboard/chat/') && pathName.split('/').length === 4;
  // Find chat partner if on chat page
  const chatPartner = useMemo(() => {
    if (!isChatPage) return null;
    const chatid = pathName.split('/')[3];
    const [userId1, userId2] = chatid.split('--');
    // Find the friend who matches the chat partner id
    const partnerId = session.user.id === userId1 ? userId2 : userId1;
    return friends.find(f => f.id === partnerId) || null;
  }, [isChatPage, pathName, friends, session.user.id]);

  return (
    <div className='fixed bg-zinc-50 border-b border-zinc-200 top-0 inset-x-0 py-2 px-4 z-50'>
      <div className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-3 min-w-0'>
          <Link
            href='/dashboard'
            className={ButtonVariants({ variant: 'ghost' })}>
            <Icons.Logo className='h-6 w-auto text-indigo-600' />
          </Link>
          {/* Show chat partner info in mobile navbar if on chat page */}
          {isChatPage && chatPartner && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-8 h-8">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src={chatPartner.image}
                  alt={`${chatPartner.name}'s profile picture`}
                  className="rounded-full"
                />
              </div>
              <span className="text-gray-700 font-semibold text-base truncate block max-w-[100px]">{chatPartner.name || 'Unknown'}</span>
            </div>
          )}
        </div>
        <Button onClick={() => setOpen(true)} className='gap-4'>
          Menu <Menu className='h-6 w-6' />
        </Button>
      </div>
      <Transition show={open} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={setOpen}>
          <div className='fixed inset-0' />

          <div className='fixed inset-0 overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden'>
              <div className='pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10'>
                <TransitionChild
                  as={Fragment}
                  enter='transform transition ease-in-out duration-500 sm:duration-700'
                  enterFrom='-translate-x-full'
                  enterTo='translate-x-0'
                  leave='transform transition ease-in-out duration-500 sm:duration-700'
                  leaveFrom='translate-x-0'
                  leaveTo='-translate-x-full'>
                  <DialogPanel className='pointer-events-auto w-screen max-w-md'>
                    <div className='flex h-full flex-col overflow-hidden bg-white py-6 shadow-xl'>
                      <div className='px-4 sm:px-6'>
                        <div className='flex items-start justify-between'>
                          <DialogTitle className='text-base font-semibold leading-6 text-gray-900'>
                            Dashboard
                          </DialogTitle>
                          <div className='ml-3 flex h-7 items-center'>
                            <button
                              type='button'
                              className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                              onClick={() => setOpen(false)}>
                              <span className='sr-only'>Close panel</span>
                              <X className='h-6 w-6' aria-hidden='true' />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className='relative mt-6 flex-1 px-4 sm:px-6'>
                        {/* Content */}

                        {friends.length > 0 ? (
                          <div className='text-xs font-semibold leading-6 text-gray-400'>
                            Your chats
                          </div>
                        ) : null}

                        <nav className='flex flex-1 flex-col'>
                          <ul
                            role='list'
                            className='flex flex-1 flex-col gap-y-7'>
                            <li>
                              <SideBarChatList
                                friends={friends}
                                sessionId={session.user.id}
                              />
                            </li>

                            <li>
                              <div className='text-xs font-semibold leading-6 text-gray-400'>
                                Overview
                              </div>
                              <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sidebaroptions.map((option) => {
                                  const Icon = Icons[option.Icon as keyof typeof Icons]
                                  return (
                                    <li key={option.name}>
                                      <Link
                                        href={option.href}
                                        className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                        <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                                          <Icon className='h-4 w-4' />
                                        </span>
                                        <span className='truncate'>
                                          {option.name}
                                        </span>
                                      </Link>
                                    </li>
                                  )
                                })}

                                <li>
                                  <FriendRequestSidebarOption
                                    initialRequestCount={
                                      unseenRequestCount
                                    }
                                    sessionId={session.user.id}
                                  />
                                </li>
                              </ul>
                            </li>

                            <li className='-ml-6 mt-auto flex items-center'>
                              <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                                <div className='relative h-8 w-8 bg-gray-50'>
                                  <Image
                                    fill
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                    src={session.user.image || ''}
                                    alt='Your profile picture'
                                  />
                                </div>

                                <span className='sr-only'>Your profile</span>
                                <div className='flex flex-col'>
                                  <span aria-hidden='true'>
                                    {session.user.name}
                                  </span>
                                  <span
                                    className='text-xs text-zinc-400'
                                    aria-hidden='true'>
                                    {session.user.email}
                                  </span>
                                </div>
                              </div>

                              <SignOutButton className='h-full aspect-square' />
                            </li>
                          </ul>
                        </nav>

                        {/* content end */}
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
};

export default MobileChatLayout;
