import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';
import {
    response_200,
    response_204,
    response_304,
    response_400,
    response_404,
    response_500
} from '../utils/responseCodes.js';

export async function acceptToken(req, res) {
    try {
        const { organizationId, email } = req.user;
        const { token } = req.body;
        if (!token) {
            return response_400(res, 'Token is required');
        }
        const tokenData = await prisma.token.findUnique({
            where: {
                token: token,
                organizationId: organizationId
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
                token: token,
                status: TokenStatus.REQUESTED,
                organizationId: organizationId
            },
            data: {
                status: TokenStatus.ISSUED,
                acceptedBy: {
                    connect: {
                        email: email
                    }
                }
            }
        });
        return response_204(res, 'Token accepted successfully');
    } catch (error) {
        return response_500(res, 'Error while accepting token', error);
    }
}

export async function rejectToken(req, res) {
    try {
        const { organizationId, email } = req.user;
        const { token, rejectionReason } = req.body;
        if (!token) {
            return response_400(res, 'Token is required');
        }
        if (!rejectionReason) {
            return response_400(res, 'Rejection reason is required');
        }
        const tokenData = await prisma.token.findUnique({
            where: {
                token: token,
                organizationId: organizationId
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
                status: TokenStatus.REJECTED,
                rejectionReason: rejectionReason,
                acceptedBy: {
                    connect: {
                        email: email
                    }
                }
            }
        });
        return response_204(res, 'Token rejected successfully');
    } catch (error) {
        return response_500(res, 'Error while rejecting token', error);
    }
}

export async function getPendingToken(req, res) {
    try {
        const { organizationId } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                status: TokenStatus.REQUESTED
            },
            select: {
                token: true,
                reason: true,
                heading: true,
                status: true,
                issuedBy: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phoneNumber: true,
                                profileImg: true
                            }
                        }
                    }
                },
                startTime: true,
                endTime: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedData = tokens.map((token) => ({
            token: token.token,
            heading: token.heading,
            reason: token.reason,
            status: token.status,
            startTime: token.startTime,
            endTime: token.endTime,
            name: token.issuedBy.user.name,
            email: token.issuedBy.user.email,
            phoneNumber: token.issuedBy.user.phoneNumber,
            profileImg: token.issuedBy.user.profileImg
        }));
        return response_200(res, 'Tokens fetched successfully', formattedData);
    } catch (error) {
        return response_500(res, 'Error while fetching tokens', error);
    }
}

export async function getAcceptedToken(req, res) {
    try {
        const { organizationId, email } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                status: TokenStatus.ISSUED,
                acceptedBy: {
                    email: email
                }
            },
            select: {
                token: true,
                reason: true,
                heading: true,
                status: true,
                issuedBy: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phoneNumber: true
                            }
                        }
                    }
                },
                startTime: true,
                endTime: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedData = tokens.map((token) => ({
            token: token.token,
            reason: token.reason,
            heading: token.heading,
            status: token.status,
            startTime: token.startTime,
            endTime: token.endTime,
            name: token.issuedBy.user.name,
            email: token.issuedBy.user.email,
            phoneNumber: token.issuedBy.user.phoneNumber
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
        const { organizationId, email } = req.user;
        const tokens = await prisma.token.findMany({
            where: {
                organizationId: organizationId,
                status: TokenStatus.REJECTED,
                acceptedBy: {
                    email: email
                }
            },
            select: {
                token: true,
                reason: true,
                heading: true,
                status: true,
                issuedBy: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phoneNumber: true
                            }
                        }
                    }
                },
                startTime: true,
                endTime: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedData = tokens.map((token) => ({
            token: token.token,
            heading: token.heading,
            reason: token.reason,
            status: token.status,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            startTime: token.startTime,
            endTime: token.endTime,
            name: token.issuedBy.user.name,
            email: token.issuedBy.user.email,
            phoneNumber: token.issuedBy.user.phoneNumber
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

export async function tokenStats(req, res) {
    try {
        const { organizationId, email } = req.user;

        const noOfTokens = await prisma.token.groupBy({
            by: 'status',
            where: {
                organizationId: organizationId,
                OR: [
                    {
                        status: TokenStatus.REQUESTED
                    },
                    {
                        status: {
                            not: TokenStatus.REQUESTED
                        },
                        acceptedBy: {
                            email: email
                        }
                    }
                ]
            },
            _count: {
                token: true
            }
        });

        const formattedData = noOfTokens.reduce(
            (newForm, curr) => {
                if (curr.status === TokenStatus.REJECTED) {
                    newForm.denied += curr._count.token;
                } else if (curr.status === TokenStatus.REQUESTED) {
                    newForm.pending += curr._count.token;
                } else newForm.approved += curr._count.token;
                return newForm;
            },
            { approved: 0, denied: 0, pending: 0 }
        );
        return response_200(
            res,
            'Token stats fetched successfully',
            formattedData
        );
    } catch (error) {
        return response_500(res, 'Error while fetching token stats', error);
    }
}
