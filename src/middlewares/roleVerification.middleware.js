import { response_403, response_500 } from '../utils/responseCodes.js';
import { ROLE } from '../utils/role.js';

export async function isAdmin(req, res, next) {
    try {
        if (req.user?.role == ROLE.admin) {
            next();
        } else {
            return response_403(res, 'Admin access required');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking admin', error);
    }
}

export async function isManager(req, res, next) {
    try {
        if (req.user?.role == ROLE.manager) {
            next();
        } else {
            return response_403(res, 'Manager access required');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking manager', error);
    }
}

export async function isSuperUser(req, res, next) {
    try {
        if (req.user?.role == ROLE.manager || req.user?.role == ROLE.admin) {
            next();
        } else {
            return response_403(res, 'Manager access required');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking manager', error);
    }
}

export async function isChecker(req, res, next) {
    try {
        if (req.user?.role == ROLE.checker) {
            next();
        } else {
            return response_403(res, 'Checker access required');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking checker', error);
    }
}

export async function isPeoples(req, res, next) {
    try {
        if (req.user?.role == ROLE.peoples) {
            next();
        } else {
            return response_403(res, 'User access required');
        }
    } catch (error) {
        console.error(error);
        return response_500(res, 'Error while checking user', error);
    }
}
