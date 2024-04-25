import { TokenStatus } from '@prisma/client';
import prisma from '../config/db.config.js';
import {
    response_200,
    response_204,
    response_400,
    response_500
} from '../utils/responseCodes.js';
import { emailValidater } from '../validaters/email.validaters.js';

export async function addSupervisor(req, res) {
    try {
        let checkerEmails = req.body.checkerEmails; // receives a list of emails
        let managerEmails = req.body.managerEmails;
        const organizationId = req.user.organizationId;

        if (!organizationId)
            return response_400(res, 'Organization ID is required!');
        if (!checkerEmails && !managerEmails)
            return response_400(res, 'Checker or Manager emails are required!');
        if (!checkerEmails) {
            checkerEmails = [];
        }
        if (!managerEmails) {
            managerEmails = [];
        }

        const validCheckerEmails = checkerEmails.filter(
            (email) => typeof email === 'string' && emailValidater(email)
        );
        const validManagerEmails = managerEmails.filter(
            (email) => typeof email === 'string' && emailValidater(email)
        );

        if (validCheckerEmails.length === 0 && validManagerEmails.length === 0)
            return response_400(res, 'Invalid Checker or Manager emails!');

        const validEmails = [...validCheckerEmails, ...validManagerEmails];
        await prisma.$transaction([
            prisma.user.createMany({
                data: validEmails.map((email) => ({ email })),
                skipDuplicates: true
            }),
            prisma.checker.createMany({
                data: validCheckerEmails.map((email) => ({
                    email: email,
                    organizationId: organizationId
                }))
            }),
            prisma.manager.createMany({
                data: validManagerEmails.map((email) => ({
                    email: email,
                    organizationId: organizationId
                }))
            })
        ]);

        return response_204(res, 'Supervisors added successfully');
    } catch (err) {
        return response_500(res, 'Error adding supervisor!', err);
    }
}

export async function getSupervisor(req, res) {
    try {
        const organizationId = req.user.organizationId;
        if (!organizationId)
            return response_400(res, 'Organization ID is required!');

        const supervisors = await prisma.organization.findUnique({
            where: {
                id: organizationId
            },
            select: {
                checker: {
                    select: {
                        email: true,
                        user: {
                            select: {
                                name: true,
                                phoneNumber: true,
                                profileImg: true
                            }
                        }
                    }
                },
                manager: {
                    select: {
                        email: true,
                        user: {
                            select: {
                                name: true,
                                phoneNumber: true,
                                profileImg: true
                            }
                        }
                    }
                }
            }
        });

        const formattedData = {
            checker: supervisors.checker.map((checker) => ({
                email: checker.email,
                name: checker.user.name,
                phoneNumber: checker.user.phoneNumber,
                profileImg: checker.user.profileImg
            })),
            manager: supervisors.manager.map((manager) => ({
                email: manager.email,
                name: manager.user.name,
                phoneNumber: manager.user.phoneNumber,
                profileImg: manager.user.profileImg
            }))
        };
        return response_200(
            res,
            'Supervisors fetched successfully',
            formattedData
        );
    } catch (err) {
        return response_500(res, 'Error fetching Supervisors!', err);
    }
}

export async function getCheckInOutpasses(req, res) {
    try {
        const organizationId = req.user.organizationId;
        if (!organizationId)
            return response_400(res, 'Organization ID is required!');

        const checkInOutpasses = await prisma.organization.findUnique({
            where: {
                id: organizationId
            },
            select: {
                checker: {
                    select: {
                        token: {
                            where: {
                                OR: [
                                    {
                                        status: TokenStatus.EXPIRED
                                    },
                                    {
                                        status: TokenStatus.LATE
                                    }
                                ]
                            },
                            select: {
                                heading: true,
                                exitTime: true,
                                returnedTime: true,
                                status: true,
                                issuedBy: {
                                    select: {
                                        email: true,
                                        user: {
                                            select: {
                                                name: true,
                                                phoneNumber: true,
                                                profileImg: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(checkInOutpasses.checker);

        const formattedData = checkInOutpasses.checker.flatMap((item) =>
            item.token.map((token) => ({
                name: token.issuedBy.user.name,
                email: token.issuedBy.email,
                phoneNumber: token.issuedBy.user.phoneNumber,
                heading: token.heading,
                exitTime: token.exitTime,
                profileImg: token.issuedBy.user.profileImg,
                returnedTime: token.returnedTime,
                status: token.status
            }))
        );

        return response_200(
            res,
            'Check-In Outpasses fetched successfully',
            formattedData
        );
    } catch (err) {
        response_500(res, 'Error fetching CheckIn Outpasses!', err);
    }
}

export async function getCheckoutOutpass(req, res) {
    try {
        const organizationId = req.user.organizationId;
        if (!organizationId)
            return response_400(res, 'Organization ID is required!');

        const checkoutOutpasses = await prisma.organization.findUnique({
            where: {
                id: organizationId
            },
            select: {
                checker: {
                    select: {
                        token: {
                            where: {
                                status: TokenStatus.IN_USE
                            },
                            select: {
                                heading: true,
                                exitTime: true,
                                issuedBy: {
                                    select: {
                                        email: true,
                                        user: {
                                            select: {
                                                name: true,
                                                phoneNumber: true,
                                                profileImg: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const formattedData = checkoutOutpasses.checker.flatMap((item) =>
            item.token.map((token) => ({
                name: token.issuedBy.user.name,
                email: token.issuedBy.email,
                phoneNumber: token.issuedBy.user.phoneNumber,
                heading: token.heading,
                exitTime: token.exitTime,
                profileImg: token.issuedBy.user.profileImg,
            }))
        );

        return response_200(
            res,
            'Check-Out Outpasses fetched successfully',
            formattedData
        );
    } catch (err) {
        response_500(res, 'Error fetching Checkout Outpasses!', err);
    }
}
