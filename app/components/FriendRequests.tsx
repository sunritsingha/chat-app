"use client";
import { Check, UserPlus, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { pusherClient } from "../lib/pusher";
import { toPusherKey } from "../lib/utils";

interface FriendRequestsProps {
  incomingFriendrequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendrequests,
  sessionId,
}) => {
  const router = useRouter();
  const [FriendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendrequests
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    console.log("subscribed to pusher: user:", sessionId);
    
    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });

    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });

    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };

  return (
    <div className="pl-4 pt-2 space-y-4">
      {FriendRequests.length === 0 ? (
        <p className="text-sm text-gray-500">nothing to show here</p>
      ) : (
        FriendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center bg-white rounded-md shadow-sm p-3">
            <UserPlus className="text-gray-500" />
            <p className="font-medium text-large">
              {request.senderEmail || "Unknown sender"}
            </p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              className="w-8 h-8 grid place-items-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-green-100 hover:shadow-md group active:scale-90"
            >
              <Check className="font-semibold text-green-600 w-3/4 h-3/4 transition-colors duration-200 group-hover:text-green-800" />
            </button>
            <button
              onClick={() => denyFriend(request.senderId)}
              className="w-8 h-8 grid place-items-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-red-100 hover:shadow-md group active:scale-90"
            >
              <X className="font-semibold text-red-600 w-3/4 h-3/4 transition-colors duration-200 group-hover:text-red-800" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
