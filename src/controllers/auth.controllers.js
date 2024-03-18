import prisma from '../config/db.config.js';
import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';

import {
    response_200,
    response_400,
    response_401,
    response_404,
    response_500
} from '../utils/responseCodes.js';
import role from '../utils/role.js';

export async function login(req, res) {
    try {
        if (
            !['peoples', 'admin', 'checker', 'manager'].includes(req.body.role)
        ) {
            return response_400(res, 'Unavailable Role');
        }
        const existingUser = await prisma[req.body.role].findUnique({
            where: {
                email: req.body.email
            },
            select: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        password: true
                    }
                }
            }
        });
        if (!existingUser) {
            return response_404(res, 'User not found');
        }
        const matchPassword = await compare(
            req.body.password,
            existingUser.user.password
        );
        if (!matchPassword) {
            return response_401(res, 'Invalid email or password');
        }
        const payLoad = {
            email: existingUser.email,
            role: req.body.role
        };
        const token = jwt.sign(payLoad, process.env.JWT_SECRET);
        return response_200(res, 'User has been logged In', {
            token,
            name: existingUser.name
        });
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function adminRegister(req, res) {
    try {
        const { email, name, password, organizationName } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            console.log(existingUser);
            return response_400(res, 'User already Registered');
        }
        const hashedPassword = await hash(password, 10);

        await prisma.organization.create({
            data: {
                name: organizationName,
                admin: {
                    create: {
                        user: {
                            create: {
                                email: email,
                                name: name,
                                password: hashedPassword
                            }
                        }
                    }
                }
            }
        });

        const payLoad = {
            email: email,
            role: role.admin
        };
        const token = jwt.sign(payLoad, process.env.JWT_SECRET);
        return response_200(res, 'User has been Registered', {
            token,
            name: name,
            email: email
        });
    } catch (error) {
        console.log(error);
        return response_500(res, 'Error in Registering', error);
    }
}

export async function peoplesRegister(req, res) {
    try {
        const { email, name, password, organizationId } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            console.log(existingUser);
            return response_400(res, 'User already Registered');
        }
        const hashedPassword = await hash(password, 10);

        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                peoples: {
                    create: {
                        organizationId: organizationId
                    }
                }
            }
        });

        const payLoad = {
            email: email,
            role: role.peoples
        };
        const token = jwt.sign(payLoad, process.env.JWT_SECRET);
        return response_200(res, 'User has been Registered', {
            token,
            name: name,
            email: email
        });
    } catch (error) {
        console.log(error);
        return response_500(res, 'Error in Registering', error);
    }
}
