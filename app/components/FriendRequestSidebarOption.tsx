"use client";
import Link from "next/link";
import { FC,  useEffect, useState } from "react";
import { User } from "lucide-react";
import React from "react";
import { pusherClient } from "../lib/pusher";
import { toPusherKey } from "../lib/utils";

interface FriendRequestSidebarOptionProps {
  sessionId: string;
  initialRequestCount: number;
}

const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({
  sessionId,
  initialRequestCount,
}) => {
  const [unseenRequestsCount, setUnseenRequestsCount] =
    useState<number>(initialRequestCount);

 useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
  // console.log("subscribed to pusher: user:", sessionId);

    const increment = () => setUnseenRequestsCount((prev) => prev + 1);
    const decrement = () => setUnseenRequestsCount((prev) => Math.max(prev - 1, 0));

    pusherClient.bind("incoming_friend_requests", increment);
    pusherClient.bind("friend_request_removed", decrement);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", increment);
      pusherClient.unbind("friend_request_removed", decrement);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="group flex items-center gap-x-2 rounded-lg p-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-300">
        <User className="h-4 w-4 stroke-gray-400 transition-colors group-hover:stroke-indigo-600" />
      </div>
      <span className="transition-colors group-hover:text-gray-900 truncate">
        Friend Requests
      </span>
      {unseenRequestsCount > 0 ? (
        <span className="ml-auto inline-block rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium leading-none text-white">
          {unseenRequestsCount}
        </span>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOption;
