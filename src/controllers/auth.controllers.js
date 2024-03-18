import prisma from '../config/db.config';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import {
    response_200,
    response_400,
    response_401,
    response_404,
    response_500
} from '../utils/responseCodes';

export async function login(req, res) {
    try {
        if (
            !['peoples', 'admin', 'checker', 'manager'].includes(req.body.role)
        ) {
            response_400(res, 'Unavailable Role');
        }
        const existingUser = await prisma[req.body.role].findUnique({
            where: {
                user: {
                    email: req.body.email
                }
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
            response_404(res, 'User not found');
        }
        const matchPassword = await compare(
            req.body.password,
            existingUser.password
        );
        if (!matchPassword) {
            response_401(res, 'Invalid email or password');
        }
        const payLoad = {
            email: existingUser.email,
            role: req.body.role
        };
        const token = sign(payLoad, process.env.JWT_SECRET);
        response_200(res, 'User has been logged In', {
            token,
            name: existingUser.name
        });
    } catch (error) {
        console.error(error);
        response_500(res, 'Server Error', error);
    }
}
