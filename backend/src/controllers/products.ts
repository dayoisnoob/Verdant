import type { Request, Response } from 'express';
import { ProductService } from '../services/products';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export class ProductController {
  static async getAllProducts(req: Request, res: Response) {
    const { category, sort, page, limit } = req.query;

    const result = await ProductService.getProducts(
      category as string,
      sort as string,
      Number(page),
      Number(limit)
    );
    res.json({
      ...new ApiResponse(200, result.message, result.data),
      pagination: result.pagination,
    });
  }

  static async getProductBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const result = await ProductService.getProductBySlug(slug as string);

    res.status(201).json(new ApiResponse(200, result.message, result.data));
  }

  static async createProduct(req: Request, res: Response) {
    const result = await ProductService.createProduct(req.body);

    res.json(new ApiResponse(201, result.message, result.data));
  }

  static async updateProduct(req: Request, res: Response) {
    const id = req.params.id as string;

    const result = await ProductService.updateProduct(id, req.body);

    res.json(new ApiResponse(200, result.message, result.data));
  }

  static async deleteProduct(req: Request, res: Response) {
    const id = req.params.id as string;

    const result = await ProductService.deleteProduct(id);

    res.json(new ApiResponse(200, result.message, result.data));
  }
}
