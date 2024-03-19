import { response_403, response_500 } from '../utils/responseCodes.js';
import userRole from '../utils/role.js';

async function isAdmin(req, res, next) {
    try {
        if (req.user.role == userRole.admin) {
            next();
        } else {
            return response_403(res, 'User not an admin');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking admin', error);
    }
}

export default isAdmin;
