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

        response_204(res, 'Supervisors added successfully');
    } catch (err) {
        response_500(res, 'Error adding supervisor!', err);
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
                                profileImg: true,
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
                                profileImg: true,
                            }
                        }
                    }
                }
            }
        })

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
        response_200(res, 'Supervisors fetched successfully', formattedData);
    } catch (err) {
        response_500(res, 'Error fetching Supervisors!', err);
    }
}
