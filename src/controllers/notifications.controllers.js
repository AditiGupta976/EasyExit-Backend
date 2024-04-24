import { NotificationStatus } from '@prisma/client';
import {
    response_200,
    response_400,
    response_500
} from '../utils/responseCodes.js';
import prisma from '../config/db.config.js';

import sendNotification from '../utils/sendFirebaseNotification.js';
// import { TOPIC } from '../utils/role.js';
export const sendNotificationToTopic = async (req, res) => {
    try {
        const { title, description, topic } = req.body;
        // const enumTopic = TOPIC?.[topic];
        const enumTopic = topic;
        if (!title || !description || !topic) {
            return response_400(res, 'Provide required parameter!');
        } else if (!enumTopic) {
            return response_400(res, 'Invalid topic!');
        }
        const { email, organizationId } = req.user;

        const notification = await prisma.notifications.create({
            data: {
                title,
                description,
                topic: enumTopic,
                sender: {
                    connect: {
                        email: email
                    }
                },
                organization: {
                    connect: {
                        id: organizationId
                    }
                }
            }
        });

        sendNotification({ title, description })
            .topic(`${organizationId}-${topic}`)
            .then(async (response) => {
                await prisma.notifications.update({
                    where: {
                        notificaitonId: notification.notificaitonId
                    },
                    data: {
                        notificationStatus: NotificationStatus.SUCCESS
                    }
                });
                console.log('Successfully sent message:', response);
            })
            .catch(async (error) => {
                await prisma.notifications.update({
                    where: {
                        notificaitonId: notification.notificaitonId
                    },
                    data: {
                        notificationStatus: NotificationStatus.FAILED
                    }
                });
                console.log('Error sending message:', error);
            });
        return response_200(res, 'Message initiated!');
    } catch (err) {
        return response_500(res, 'error sending notification!', err);
    }
};

export const getNotification = async (req, res) => {
    try {
        const { topic } = req.body;
        const { organizationId } = req.user;

        const notification = await prisma.notifications.findMany({
            where: { topic, organizationId },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response_200(
            res,
            'Notifications received successfully',
            notification
        );
    } catch (err) {
        return response_500(res, 'error sending notification!', err);
    }
};
