import { fetchRedis } from "@/app/helpers/redis";
import { authOptions } from "@/app/lib/auth";
import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import z from "zod";
import { pusherServer } from "@/app/lib/pusher";
import { toPusherKey } from "@/app/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //both users are not already friends
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    //the user that is accepting the request has actually received a request from the other user
    const hasFriendRequest = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    )) as 0 | 1;

    if (!hasFriendRequest) {
      return new Response("No friend request from this user", { status: 400 });
    }

    //notify added user
    await pusherServer.trigger(
      toPusherKey(`user:${session.user.id}:friends`),
      "new_friend",
      { }
    );
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:friends`),
      "new_friend",
      { }
    );

    await db.sadd(`user:${session.user.id}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    // Notify sidebar to decrement count
    await pusherServer.trigger(
      toPusherKey(`user:${session.user.id}:incoming_friend_requests`),
      "friend_request_removed",
      { senderId: idToAdd }
    );

  // console.log("has friend request");

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
