import { fetchRedis } from "@/app/helpers/redis";
import { authOptions } from "@/app/lib/auth";
import db from "@/app/lib/db";
import { pusherServer } from "@/app/lib/pusher";
import { toPusherKey } from "@/app/lib/utils";
import { messageValidator } from "@/app/lib/validations/message";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!text || !chatId) {
      return new Response("Invalid request", { status: 400 });
    }

    const [userId1, userId2] = chatId.split("--");
    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const recipientId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    if (!friendList.includes(recipientId)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sender = await fetchRedis(
      "get",
      `user:${session.user.id}`
    ).then((res) => JSON.parse(res) as User);
    //console.log("SENDER", sender);

    const messageData: Message = {
      id: crypto.randomUUID(),
      text,
      senderId: session.user.id,
      timestamp: Date.now(),
    };

    const message = messageValidator.parse(messageData);

  //notify connected chat partners of new message
  //console.log("Triggering Pusher:", toPusherKey(`chat:${chatId}`), 'incoming_message', message);
  await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming_message', message);
  await pusherServer.trigger(toPusherKey(`user:${recipientId}:chats`), 'new_message', {
    ...message,
    senderImg: sender.image,
    senderName: sender.name,
  });



    //all valid , send the message now
    await db.zadd(`chat:${chatId}:messages`, {
      score: Date.now(),
      member: JSON.stringify(message),
    });

    return new Response("OK");

  } catch (error) {
    if (error instanceof Error) {
      return new Response("error", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
    
  }
}
