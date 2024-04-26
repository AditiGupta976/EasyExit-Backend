import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';
import {
    response_401,
    response_200,
    response_500,
    response_201
} from '../utils/responseCodes.js';
import { ROLE } from '../utils/role.js';

export async function requestToken(req, res) {
    try {
        const { email, organizationId } = req.user;
        const { reason, startTime, endTime, heading } = req.body;

        if (!reason || !startTime || !endTime) {
            return response_401(res, 'Please provide all the fields');
        }

        const token = await prisma.token.create({
            data: {
                reason: reason,
                startTime: startTime,
                heading: heading,
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

export async function getAcceptedOutpasses(req, res) {
    try {
        const { email, organizationId } = req.user;
        const outpasses = await prisma.peoples.findUnique({
            where: {
                email: email,
                organizationId: organizationId
            },
            select: {
                token: {
                    where: {
                        OR: [
                            {
                                status: TokenStatus.ISSUED
                            },
                            {
                                status: TokenStatus.EXPIRED
                            },
                            {
                                status: TokenStatus.LATE
                            },
                            {
                                status: TokenStatus.IN_USE
                            }
                        ]
                    },
                    select: {
                        token: true,
                        heading: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        acceptedBy: {
                            select: {
                                user: {
                                    select: {
                                        name: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const formattedData = outpasses.token.map((token) => ({
            token: token.token,
            heading: token.heading,
            startTime: token.startTime,
            endTime: token.endTime,
            status: token.status,
            acceptedBy: token.acceptedBy.user.name,
            phoneNumber: token.acceptedBy.user.phoneNumber
        }));

        return response_200(
            res,
            'Accepted Outpasses fetched successfully',
            formattedData
        );
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function getToken(req, res) {
    try {
        const { role } = req.user;
        const tokenId = req.query['tokenId'];
        if (role !== ROLE.peoples) {
            return response_401(
                res,
                'You are not authorized to access this route'
            );
        }

        const token = await prisma.token.findUnique({
            where: {
                token: tokenId
            },
            select: {
                token: true,
                heading: true,
                startTime: true,
                endTime: true,
                status: true,
                rejectionReason: true,
                acceptedBy: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                phoneNumber: true
                            }
                        }
                    }
                }
            }
        });
        
        const formattedData = {
            token: token.token,
            heading: token.heading,
            reason: token.rejectionReason,
            startTime: token.startTime,
            endTime: token.endTime,
            status: token.status,
            acceptedBy: token.acceptedBy?.user.name,
            phoneNumber: token.acceptedBy?.user.phoneNumber
        };

        response_201(res, 'Token fetched successfully', formattedData);
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function getRejectedOutpasses(req, res) {
    try {
        const { email, organizationId } = req.user;
        const outpasses = await prisma.peoples.findUnique({
            where: {
                email: email,
                organizationId: organizationId
            },
            select: {
                token: {
                    where: {
                        status: TokenStatus.REJECTED
                    },
                    select: {
                        token: true,
                        heading: true,
                        rejectionReason: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        acceptedBy: {
                            select: {
                                user: {
                                    select: {
                                        name: true,
                                        phoneNumber: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
            
        const formattedData = outpasses.token.map((token) => ({
            token: token.token,
            heading: token.heading,
            reason: token.rejectionReason,
            startTime: token.startTime,
            endTime: token.endTime,
            status: token.status,
            acceptedBy: token.acceptedBy.user.name,
            phoneNumber: token.acceptedBy.user.phoneNumber
        }));

        return response_200(
            res,
            'Rejected Outpasses fetched successfully',
            formattedData
        );
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function getPendingOutpasses(req, res) {
    try {
        const { email, organizationId } = req.user;
        const outpasses = await prisma.peoples.findUnique({
            where: {
                email: email,
                organizationId: organizationId
            },
            select: {
                token: {
                    where: {
                        status:TokenStatus.REQUESTED
                    },
                    select: {
                        token: true,
                        heading: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                    }
                }
            }
        });

        const formattedData = outpasses.token.map((token) => ({
            token: token.token,
            heading: token.heading,
            startTime: token.startTime,
            endTime: token.endTime,
            status: token.status,
        }));

        return response_200(
            res,
            'Accepted Outpasses fetched successfully',
            formattedData
        );
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}