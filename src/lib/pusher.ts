import PusherServer from "pusher";
import PusherClient from "pusher-js";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

export const pusherServer =
  appId && key && secret && cluster
    ? new PusherServer({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      })
    : null;

export const createPusherClient = () => {
  if (!key || !cluster) return null;
  return new PusherClient(key, {
    cluster,
  });
};
