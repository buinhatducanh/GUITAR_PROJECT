import { Response } from 'express';

export const successResponse = (res: Response, data: any, status: number = 200) => {
    return res.status(status).json({
        success: true,
        data
    });
};

export const errorResponse = (res: Response, error: any, status: number = 500) => {
    const message = error?.message || 'Internal server error';
    return res.status(status).json({
        success: false,
        error: message
    });
};

export const validationErrorResponse = (res: Response, errors: any) => {
    return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
    });
};

export const notFoundResponse = (res: Response, resource: string = 'Resource') => {
    return res.status(404).json({
        success: false,
        error: `${resource} not found`
    });
};

export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized') => {
    return res.status(401).json({
        success: false,
        error: message
    });
};

export const forbiddenResponse = (res: Response, message: string = 'Forbidden') => {
    return res.status(403).json({
        success: false,
        error: message
    });
};
