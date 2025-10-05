import ChatInput from "@/app/components/ChatInput";
import Messages from "@/app/components/Messages";
import { fetchRedis } from "@/app/helpers/redis";
import { authOptions } from "@/app/lib/auth";
import db from "@/app/lib/db";
import { messageArrayValidator } from "@/app/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";


async function getChatMessages(chatid: string) {
  try {
    const result: string[] = await fetchRedis(
      "zrange",
      `chat:${chatid}:messages`,
      0,
      -1
    );
    const dbmessages = result.map((message) => JSON.parse(message) as Message);

    const reverseDbMessages = dbmessages.reverse();
    const messages = messageArrayValidator.parse(reverseDbMessages);
    return messages;
  } catch {
    notFound();
  }
}

const page = async ({ params }: { params: Promise<{ chatid: string }> }) => {
  const { chatid } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return notFound();
  }

  const { user } = session;
  const [userId1, userId2] = chatid.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    return notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatid);

  return (
  <div className="flex flex-col min-h-screen h-full flex-1 justify-between pb-4">
      {/* Hide header on mobile, show only on sm+ */}
      <div className="hidden sm:flex items-center py-3 border-b-2 border-gray-200 px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              fill
              referrerPolicy="no-referrer"
              src={chatPartner.image}
              alt={`${chatPartner.name}'s profile picture`}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-gray-700 font-semibold text-xl truncate block max-w-none"> 
              {chatPartner.name || 'Unknown'}
            </span>
            <span className="text-sm text-gray-600 truncate block max-w-none">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        chatpartner={chatPartner}
        sessionImage={session.user.image}
        chatId={chatid}
      />
      <ChatInput chatId={chatid} chatPartner={chatPartner} />
    </div>
  );
};

export default page;
