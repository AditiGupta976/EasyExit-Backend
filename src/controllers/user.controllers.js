import prisma from '../config/db.config.js';
import {
    response_401,
    response_200,
    response_500,
    response_201
} from '../utils/responseCodes.js';

export async function requestToken(req, res) {
    try {
        const { email, organizationId } = req.user;
        const { reason, startTime, endTime } = req.body;

        if (!reason || !startTime || !endTime) {
            return response_401(res, 'Please provide all the fields');
        }

        const token = await prisma.token.create({
            data: {
                reason: reason,
                startTime: startTime,
                endTime: endTime,
                organizationId: organizationId,
                issuedBy: {
                    connect: {
                        email: email
                    }
                }
            },
            select: {
                token: true
            }
        });
        response_201(res, 'Token has been requested', token);
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}
