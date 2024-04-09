import { response_400 } from '../utils/responseCodes.js';
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export const middlewareEmailValidater = (req, res, next) => {
    const email = req.body.email;
    if (!email) {
        return response_400(res, 'Email is required');
    }
    if (!emailRegex.test(email)) {
        return response_400(res, 'Invalid Email');
    }
    next();
};

export const emailValidater = (email) => {
    if (!email || !emailRegex.test(email)) {
        return false;
    }
    return true;
};
