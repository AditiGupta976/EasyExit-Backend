import prisma from '../config/db.config';
import {
    response_200,
    response_400,
    response_500
} from '../utils/responseCodes';

export async function acceptToken(req, res) {}

export async function rejectToken(req, res) {}

export async function getAllTokens(req, res) {
    try {
        const { organizationId } = req.user;
        if (!organizationId) {
            return response_400(res, 'Organization ID is required');
        }
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId
            },
            select: {
                id: true,
                token: true,
                reason: true,
                status: true,
                issuedBy: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                createdAt: true,
                updatedAt: true,
                startTime: true,
                endTime: true
            }
        });
        const formattedData = tokens.map((token) => ({
            id: token.id,
            token: token.token,
            reason: token.reason,
            status: token.status,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            startTime: token.startTime,
            endTime: token.endTime,
            name: token.issuedBy.user.name,
            email: token.issuedBy.user.email
        }));
        return response_200(res, 'Tokens fetched successfully', formattedData);
    } catch (error) {
        return response_500(res, 'Error while fetching tokens', error);
    }
}

export async function getAcceptedToken(req, res) {}

export async function getRejectedToken(req, res) {}
