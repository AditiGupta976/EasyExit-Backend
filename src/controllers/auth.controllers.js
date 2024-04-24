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
import { ROLE } from '../utils/role.js';
import cloudinary from '../config/cloudinary.config.js';

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
                },
                organizationId: true
            }
        });
        if (!existingUser) {
            return response_404(res, 'User not found');
        }
        if ((role == ROLE.checker || role == ROLE.manager) && !existingUser.user.password) {
            const hashedPassword = await hash(password, 10);
            await prisma[role].update({
                where: {
                    email: email,
                    organizationId: existingUser.organizationId
                },
                data: {
                    user: {
                        update: {
                            password: hashedPassword
                        }
                    }
                }
            });
        } else {
            const matchPassword = await compare(
                password,
                existingUser.user.password
            );
            if (!matchPassword) {
                return response_401(res, 'Invalid email or password');
            }
        }
        const payLoad = {
            email: existingUser.user.email,
            role: role,
            organizationId: existingUser.organizationId
        };
        const token = jwt.sign(payLoad, process.env.JWT_SECRET);
        return response_200(res, 'User has been logged In', {
            token,
            name: existingUser.user.name,
            organizationId: existingUser.organizationId
        });
    } catch (error) {
        console.error(error);
        return response_500(res, 'Server Error', error);
    }
}

export async function adminRegister(req, res) {
    try {
        const {
            email,
            name,
            password,
            organizationName,
            unrestrictedStartTime,
            unrestrictedEndTime
        } = req.body;
        let { organizationLogo, profileImg } = req.body;
        if (organizationLogo) {
            const imageUpload = await cloudinary.v2.uploader.upload(
                organizationLogo,
                {
                    resource_type: 'image',
                    folder: 'organization',
                    format: 'png',
                    allowed_formats: ['png', 'jpg', 'jpeg'],
                    overwrite: true,
                    public_id: `${Date.now()}-organization-${organizationName}`
                }
            );
            organizationLogo = imageUpload.secure_url;
        }
        if (profileImg) {
            const imageUpload = await cloudinary.v2.uploader.upload(
                profileImg,
                {
                    resource_type: 'image',
                    folder: 'profile',
                    format: 'png',
                    allowed_formats: ['png', 'jpg', 'jpeg'],
                    overwrite: true,
                    public_id: `${Date.now()}-profile-${name}`
                }
            );
            profileImg = imageUpload.secure_url;
        }

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
                ...(unrestrictedStartTime && {
                    unrestrictedStartTime: unrestrictedStartTime
                }),
                ...(unrestrictedEndTime && {
                    unrestrictedEndTime: unrestrictedEndTime
                }),
                ...(organizationLogo && { organizationLogo: organizationLogo }),
                admin: {
                    create: {
                        user: {
                            create: {
                                email: email,
                                name: name,
                                password: hashedPassword,
                                ...(profileImg && { profileImg: profileImg })
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
            token
        });
    } catch (error) {
        console.log(error);
        return response_500(res, 'Error in Registering', error);
    }
}

export async function peoplesRegister(req, res) {
    try {
        const { email, name, password, organizationId } = req.body;
        let profileImg = req.body.profileImg;
        if (profileImg) {
            const imageUpload = await cloudinary.v2.uploader.upload(
                profileImg,
                {
                    resource_type: 'image',
                    folder: 'profile',
                    format: 'png',
                    allowed_formats: ['png', 'jpg', 'jpeg'],
                    overwrite: true,
                    public_id: `${Date.now()}-profile-${name}`
                }
            );
            profileImg = imageUpload.secure_url;
        }

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
                ...(profileImg && { profileImg: profileImg }),
                peoples: {
                    create: {
                        organization: {
                            connect: {
                                id: organizationId
                            }
                        }
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
            token
        });
    } catch (error) {
        console.log(error);
        return response_500(res, 'Error in Registering', error);
    }
}

export async function supervisorRegister(req, res) {
    try {
        const { email, name, password, role } = req.body;
        let profileImg = req.body.profileImg;
        if (profileImg) {
            const imageUpload = await cloudinary.v2.uploader.upload(
                profileImg,
                {
                    resource_type: 'image',
                    folder: 'profile',
                    format: 'png',
                    allowed_formats: ['png', 'jpg', 'jpeg'],
                    overwrite: true,
                    public_id: `${Date.now()}-profile-${req.userId}`
                }
            );
            profileImg = imageUpload.secure_url;
        }

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
                password: hashedPassword,
                ...(profileImg && { profileImg: profileImg })
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
