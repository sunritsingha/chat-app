const upstashredisresturl = process.env.UPSTASH_REDIS_REST_URL;
const upstashredistoken = process.env.UPSTASH_REDIS_REST_TOKEN;

type command = `zrange` | `sismember` | `get` | `smembers`;

export async function fetchRedis(command: command, ...args: (string | number)[]) {
  if (!upstashredisresturl || !upstashredistoken) {
    throw new Error("Missing Upstash Redis environment variables");
  }

  const commandURL = `${upstashredisresturl}/${command}/${args.join("/")}`;

  const response = await fetch(commandURL, {
    headers: {
      Authorization: `Bearer ${upstashredistoken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Error executing Redis command : " + response.statusText);
  }

  const data = await response.json();
  return data.result;
}
