import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';
import {
    response_200,
    response_304,
    response_400,
    response_404,
    response_500
} from '../utils/responseCodes.js';

export async function acceptToken(req, res) {
    try {
        const { organizationId } = req.user;
        const { token } = req.body;
        if (!token) {
            return response_400(res, 'Token is required');
        }
        const tokenData = await prisma.token.findUnique({
            where: {
                token: token
            },
            select: {
                status: true
            }
        });
        if (!tokenData) {
            return response_404(res, 'Token not found');
        }
        if (tokenData.status === TokenStatus.ISSUED) {
            return response_304(res, 'Token already accepted');
        }
        const updatedToken = await prisma.token.update({
            where: {
                id: token,
                status: TokenStatus.REQUESTED,
                organizationId: organizationId
            },
            data: {
                status: TokenStatus.ISSUED
            }
        });
        return response_200(res, 'Token accepted successfully', updatedToken);
    } catch (error) {
        return response_500(res, 'Error while accepting token', error);
    }
}

export async function rejectToken(req, res) {
    try {
        const { organizationId } = req.user;
        const { token } = req.body;
        if (!token) {
            return response_400(res, 'Token is required');
        }
        const tokenData = await prisma.token.findUnique({
            where: {
                token: token
            }
        });
        if (!tokenData) {
            return response_404(res, 'Token not found');
        }
        const updatedToken = await prisma.token.update({
            where: {
                token: token,
                organizationId: organizationId,
                status: TokenStatus.REQUESTED
            },
            data: {
                status: TokenStatus.REJECTED
            }
        });
        return response_200(res, 'Token rejected successfully', updatedToken);
    } catch (error) {
        return response_500(res, 'Error while rejecting token', error);
    }
}

export async function getAllTokens(req, res) {
    try {
        const { organizationId } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId
            },
            select: {
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

export async function getAcceptedToken(req, res) {
    try {
        const { organizationId } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                status: TokenStatus.ISSUED
            },
            select: {
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
        return response_200(
            res,
            'Accepted tokens fetched successfully',
            formattedData
        );
    } catch (error) {
        return response_500(res, 'Error while fetching accepted tokens', error);
    }
}

export async function getRejectedToken(req, res) {
    try {
        const { organizationId } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                status: TokenStatus.REJECTED
            },
            select: {
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
        return response_200(
            res,
            'Rejected tokens fetched successfully',
            formattedData
        );
    } catch (error) {
        return response_500(res, 'Error while fetching rejected tokens', error);
    }
}
