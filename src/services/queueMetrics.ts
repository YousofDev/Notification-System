import { getChannel } from "@config/rabbitmq";

export async function getQueueStatus(queue: string) {
  const channel = getChannel();
  const { messageCount, consumerCount } = await channel.checkQueue(queue);
  return { queue, messageCount, consumerCount };
}
