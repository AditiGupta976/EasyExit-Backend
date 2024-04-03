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
import ROLE from '../utils/role.js';

export async function login(req, res) {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return response_400(res, 'Fields missing, check documentation');
        }
        if (!(role in ROLE)) {
            return response_400(res, 'Unavailable Role');
        }
        const existingUser = await prisma[role].findUnique({
            where: {
                email: email
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
            password,
            existingUser.user.password
        );
        if (!matchPassword) {
            return response_401(res, 'Invalid email or password');
        }
        const payLoad = {
            email: existingUser.email,
            role: role,
            organizationId: existingUser.organizationId
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

        if (!email || !name || !password || !organizationName) {
            return response_400(res, 'Feilds missing, check documentation');
        }

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

        const data = await prisma.organization.create({
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
            },
            select: {
                id: true
            }
        });

        const payLoad = {
            email: email,
            role: ROLE.admin,
            organizationId: data.id
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

        if (!email || !name || !password || !organizationId) {
            return response_400(res, 'Feilds missing, check documentation');
        }

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
            role: ROLE.peoples,
            organizationId: organizationId
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

export async function validate(req, res) {
    try {
        const { email, organizationId, role } = req.body;

        if (!email || !role || !organizationId) {
            return response_400(res, 'Feilds missing, check documentation');
        }

        if (role != ROLE.manager && role != ROLE.checker) {
            return response_400(res, 'Not a valid role for validation');
        }

        const existingSupervisor = await prisma[role].findUnique({
            where: {
                organizationId: organizationId,
                email: email
            }
        });
        if (existingSupervisor) {
            return response_200(res, 'validated for organization', {
                email: email,
                role: role
            });
        } else {
            return response_400(res, 'Not registered for organization');
        }
    } catch (error) {
        console.log(error);
        return response_500(res, 'Error in Validating', error);
    }
}

export async function supervisorRegister(req, res) {
    try {
        const { email, name, password, role } = req.body;

        if (!email || !name || !password || !role) {
            return response_400(res, 'Feilds missing, check documentation');
        }

        if (role != ROLE.manager && role != ROLE.checker) {
            return response_400(
                res,
                'Not a valid role for supervisor registration'
            );
        }
        const hashedPassword = await hash(password, 10);

        const data = await prisma.user.update({
            where: {
                email: email
            },
            data: {
                name: name,
                password: hashedPassword
            },
            select: {
                [role]: {
                    select: {
                        organizationId: true
                    }
                }
            }
        });

        const payLoad = {
            email: email,
            role: role,
            organizationId: data[role].organizationId
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
