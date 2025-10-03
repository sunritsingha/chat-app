import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/app/lib/auth'
import { messageArrayValidator } from '@/app/lib/validations/message'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'



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
  } catch (error) {
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
  const [userId1, userId2] = chatid.split('--');

  if (user.id !== userId1 && user.id !== userId2) {
    return notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const initialMessages = await getChatMessages(chatid);

  return <div>page {chatid}</div>;
};

export default page