import { prisma } from "../lib/prisma";
import { NotificationReason } from '../generated/prisma/client.js';

interface CreateNotificationInput {
  creatorId: number;
  receiverId: number;
  reason: NotificationReason;
}

export const createNotification = async ({
  creatorId,
  receiverId,
  reason,
}: CreateNotificationInput) => {
  // 🔒 Rule 1: Don't notify yourself
  if (creatorId === receiverId) return;

  await prisma.notification.create({
    data: {
      creator_id: creatorId,
      receiver_id: receiverId,
      reason,
    },
  });
};
