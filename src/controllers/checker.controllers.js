import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';

import {
    response_200,
    response_400,
    response_500,
    response_404,
    response_204
} from '../utils/responseCodes.js';

export async function checkToken(req, res) {
    try {
        const { email, organizationId } = req.user;
        const { tokenId } = req.body;

        const currTime = new Date();
        const token = await prisma.token.findUnique({
            where: {
                token: tokenId,
                organizationId: organizationId
            },
            select: {
                startTime: true,
                endTime: true,
                status: true,
                organizationId: true,
                exitTime: true
            }
        });

        if (!token) {
            return response_404(res, 'Token not found');
        }
        if (
            token.status !== TokenStatus.ISSUED &&
            token.status !== TokenStatus.IN_USE
        ) {
            return response_400(res, 'Not a valid Token to use');
        }

        if (!token.exitTime) {
            if (token.startTime > currTime) {
                return response_400(res, 'not permitted to visit at this time');
            }
            await prisma.token.update({
                where: {
                    token: tokenId,
                    organizationId: organizationId
                },
                data: {
                    exitTime: currTime,
                    status: TokenStatus.IN_USE,
                    checkedBy:{
                        connect:{
                            email: email
                        }
                    }
                }
            });
            return response_204(res, 'token verified successfully');
        } else {
            await prisma.token.update({
                where: {
                    token: tokenId,
                    organizationId: organizationId
                },
                data: {
                    returnedTime: currTime,
                    status:
                        token.endTime < currTime
                            ? TokenStatus.LATE
                            : TokenStatus.EXPIRED
                }
            });
            return response_204(res, 'token verified successfully');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function getCheckedTokens(req, res) {
    try {
        const { email, organizationId } = req.user;
        const search = req.query?.search;

        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                checkedByUid: email,
                ...(search && {
                    OR: [
                        {
                            heading: {
                                search: search
                            }
                        },
                        {
                            reason: {
                                search: search
                            }
                        },
                        {
                            token: search
                        }
                    ]
                })
            },
            select: {
                token: true,
                heading: true,
                exitTime: true,
                returnedTime: true,
                status: true
            }
        });
        console.log(tokens);
        return response_200(res, 'Tokens checked by you', tokens);
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}
