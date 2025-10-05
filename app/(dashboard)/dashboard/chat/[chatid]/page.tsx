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
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative  flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name}'s profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex text-xl items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
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
