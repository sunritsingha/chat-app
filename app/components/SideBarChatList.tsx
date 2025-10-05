"use client";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { chatHrefConstructor, toPusherKey } from "../lib/utils";
import { pusherClient } from "../lib/pusher";
import toast from "react-hot-toast";
import UnseenChatToast from "./unseenChatToast";

interface SideBarChatListProps {
  friends: User[];
  sessionId: string;
}

interface extendedMessage extends Message {
  senderImg: string | null | undefined;
  senderName: string | null | undefined;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathName = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    const ChatHandler = (message: extendedMessage) => {
      //console.log("New message received in sidebar:", message);
      const shouldNotify =
        pathName !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;
      if (shouldNotify) return;

      //should be notified only if not on the chat page with the sender
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg!}
          senderName={message.senderName!}
          senderMessage={message.text!}
        />
      ));

       setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = () => {
      router.refresh();
    };
    pusherClient.bind("new_message", ChatHandler);
    pusherClient.bind("new_friend", newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new_message", ChatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [sessionId, pathName]);

  useEffect(() => {
    if (pathName?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName, sessionId, router]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends
        ?.filter(Boolean)
        .sort()
        .map((friend) => {
          if (!friend?.id) return null;
          const unseenMessagesCount = unseenMessages.filter(
            (unseenMsg) => unseenMsg.senderId === friend.id
          ).length;
          //console.log("sessionId", sessionId, "friend.id", friend.id);
          return (
            <li key={friend.id}>
              <a
                href={`/dashboard/chat/${chatHrefConstructor(
                  sessionId,
                  friend.id
                )}`}
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                {friend.name}
                {unseenMessagesCount > 0 ? (
                  <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                    {unseenMessagesCount}
                  </div>
                ) : null}
              </a>
            </li>
          );
        })}
    </ul>
  );
};

export default SideBarChatList;
