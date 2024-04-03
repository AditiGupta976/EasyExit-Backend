import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';

import {
    response_201,
    response_401,
    response_400,
    response_500
} from '../utils/responseCodes.js';
import ROLE from '../utils/role.js';

export async function checkToken(req, res) {
    try {
        const { email, organizationId, role } = req.user;
        const { tokenId } = req.body;

        const currTime = new Date();

        if (role !== ROLE.checker) {
            return response_401(res, 'You are not authorized to check token');
        }

        const token = await prisma.token.findUnique({
            where: {
                token: tokenId
            },
            select: {
                startTime: true,
                endTime: true,
                status: true,
                organizationId: true
            }
        });

        if (token.organizationId !== organizationId) {
            return response_401(res, 'You are not authorized to check token');
        }

        if (
            token.status !== TokenStatus.ISSUED ||
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
                    token: tokenId
                },
                data: {
                    exitTime: currTime,
                    status: TokenStatus.IN_USE,
                    checkedByUid: {
                        connnect: {
                            email: email
                        }
                    }
                }
            });
            return response_201(res, 'token verified successfully');
        } else {
            await prisma.token.update({
                where: {
                    token: tokenId
                },
                data: {
                    returnedTime: currTime,
                    status:
                        token.endTime < currTime
                            ? TokenStatus.LATE
                            : TokenStatus.EXPIRED
                }
            });
            return response_201(res, 'token verified successfully');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function getCheckedTokens(req, res) {}
