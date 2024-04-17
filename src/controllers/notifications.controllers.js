import { NotificationStatus } from '@prisma/client';
import {
    response_200,
    response_400,
    response_500
} from '../utils/responseCodes.js';
import prisma, { connDB } from '../config/db.config.js';

import sendNotification from '../utils/sendFirebaseNotification.js';
export const sendNotificationToTopic = async (req, res) => {
    try {
        const { title, description, topic } = req.body;
        if (!title || !description || !topic)
            response_400(res, 'Provide required parameter!');
        const { email, organizationId } = req.user;
        console.log(req.user);

        const notification = await prisma.notifications.create({
            data: {
                title,
                description,
                topic,
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

        const actual_topic = `${organizationId}-${topic}`;
        sendNotification({ title, description })
            .topic(actual_topic)
            .then((response) => {
                prisma.notifications.update({
                    where: {
                        notificaitonId: notification.notificaitonId
                    },
                    data: {
                        notificationStatus: NotificationStatus.SUCCESS
                    }
                });
                console.log('Successfully sent message:', response);
                response_200(res, 'Success', {
                    response
                });
            })
            .catch((error) => {
                prisma.notifications.update({
                    where: {
                        notificaitonId: notification.notificaitonId
                    },
                    data: {
                        notificationStatus: NotificationStatus.FAILED
                    }
                });
                response_500(res, 'Failed!', {
                    error
                });
                console.log('Error sending message:', error);
            });
    } catch (err) {
        response_500(res, 'error sending notification!', err);
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

        response_200(res, 'Notifications received successfully', notification);
    } catch (err) {
        response_500(res, 'error sending notification!', err);
    }
};
