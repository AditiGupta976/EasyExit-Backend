import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import dotenv from 'dotenv';
dotenv.config();

const app = initializeApp({
    credential: applicationDefault(),
    projectId: 'easy-exit-sdf'
});

const sendNotification = (data) => {
    /**
     * Usage:
     * sendNotification({ name: "swaroop dora" }).topic("ann") -> promise;
     * sendNotification({ name: "swaroop dora" }).token("ann") -> promise;
     */
    const message = { data };

    const sendMessage = () => {
        return getMessaging().send(message);
    };

    const topic = (topic_name) => {
        message.topic = topic_name;
        console.log(message)
        return sendMessage();
    };

    const token = (token_id) => {
        message.token = token_id;
        return sendMessage();
    };

    return {
        topic,
        token
    };
};

// const message = {
//     name: 'swaroop dora'
// };

// sendNotification(message)
//     .topic('ann')
//     .then((response) => {
//         console.log(response);
//     });

export default sendNotification;
