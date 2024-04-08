import jwt from 'jsonwebtoken';
import { response_401, response_500 } from '../utils/responseCodes.js';

async function userAuth(req, res, next) {
    //retrieve jwtToken value from client's request header
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader === null || authHeader === undefined) {
            return response_401(res, 'Unauthorized');
        }
        const payload = jwt.verify(
            authHeader.split(' ')[1],
            process.env.JWT_SECRET
        );
        req.user = payload;
        next();
    } catch (error) {
        console.error(error);
        response_500(res, 'Error while verifying token', error);
    }
}

export default userAuth;
