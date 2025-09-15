"use client";
import { Check, Icon, UserPlus, X } from "lucide-react";
import { FC, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

    const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept',
      {id: senderId}
    ) 

    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.refresh();
  }

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny',
      {id: senderId}
    )

    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.refresh();
  }

  return (
    <>
      {FriendRequests.length === 0 ? (
        <p className="text-sm text-gray-500">nothing to show here</p>
      ) : (
        FriendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-gray-500" />
            <p className="font-medium text-large">
              {request.senderEmail || "Unknown sender"}
            </p>
            <button
              className="w-8 h-8 grid place-items-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-green-100 hover:shadow-md group active:scale-90"
            >
              <Check className="font-semibold text-green-600 w-3/4 h-3/4 transition-colors duration-200 group-hover:text-green-800" />
            </button>
            <button
              className="w-8 h-8 grid place-items-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-red-100 hover:shadow-md group active:scale-90"
            >
              <X className="font-semibold text-red-600 w-3/4 h-3/4 transition-colors duration-200 group-hover:text-red-800" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
