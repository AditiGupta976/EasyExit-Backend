import prisma from '../config/db.config';
import {
    response_401,
    response_200,
    response_500
} from '../utils/responseCodes';
import ROLE from '../utils/role';
export async function requestToken(req, res) {
    try {
        const { email, organizationId, role } = req.user;
        const {reason, startTime, endTime } = req.body;

        if (role !== ROLE.peoples) {
            return response_401(res, 'You are not authorized to request token');
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
                },
            },
        })
        
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function generatePassForVerification(req, res) {}
