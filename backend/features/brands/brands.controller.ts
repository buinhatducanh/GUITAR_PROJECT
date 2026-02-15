import { Request, Response } from 'express';
import * as brandService from './brands.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../../shared/utils/response.js';

export const getAllBrands = async (req: Request, res: Response) => {
    try {
        const result = await brandService.getAllBrands(req.query);
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const getBrandBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const brand = await brandService.getBrandBySlug(slug);
        return successResponse(res, brand);
    } catch (error) {
        if (error instanceof Error && error.message === 'Brand not found') {
            return notFoundResponse(res, 'Brand');
        }
        return errorResponse(res, error);
    }
};

export const getBrandProducts = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { limit = '20', offset = '0' } = req.query;

        const result = await brandService.getBrandProducts(
            id,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const createBrand = async (req: Request, res: Response) => {
    try {
        const brand = await brandService.createBrand(req.body);
        return successResponse(res, brand, 201);
    } catch (error) {
        if (error instanceof Error && error.message === 'Brand slug already exists') {
            return errorResponse(res, error, 400);
        }
        return errorResponse(res, error);
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const brand = await brandService.updateBrand(id, req.body);
        return successResponse(res, brand);
    } catch (error) {
        if (error instanceof Error && error.message === 'Brand slug already exists') {
            return errorResponse(res, error, 400);
        }
        return errorResponse(res, error);
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await brandService.deleteBrand(id);
        return successResponse(res, result);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cannot delete brand')) {
            return errorResponse(res, error, 400);
        }
        return errorResponse(res, error);
    }
};

export const getBrandAnalytics = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const analytics = await brandService.getBrandAnalytics(id);
        return successResponse(res, analytics);
    } catch (error) {
        return errorResponse(res, error);
    }
};
