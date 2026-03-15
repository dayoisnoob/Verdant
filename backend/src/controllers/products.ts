import type { Request, Response } from 'express';
import { ProductService } from '../services/products';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    const result = await ProductService.createProduct(req.body);

    res.status(201).json(new ApiResponse(201, 'Product(s) created', result));
  }

  static async getProductBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const product = await ProductService.getProductBySlug(slug as string);

    res.json(new ApiResponse(200, 'Product fetched', { product }));
  }

  static async getAllProducts(req: Request, res: Response) {
    const { category, sort, page, limit, filter } = req.parsedQuery as {
      category: string;
      sort: string;
      page: number;
      limit: number;
      filter: string;
    };

    const result = await ProductService.getProducts(
      category as string,
      sort as string,
      page,
      limit,
      filter as string
    );

    res.json(
      new ApiResponse(200, 'Products fetched', {
        products: result.products,
        pagination: result.pagination,
      })
    );
  }

  static async updateProduct(req: Request, res: Response) {
    const id = req.params.id as string;

    const product = await ProductService.updateProduct(id, req.body);

    res.json(new ApiResponse(200, 'Product updated', { product }));
  }

  static async deleteProduct(req: Request, res: Response) {
    const id = req.params.id as string;

    const product = await ProductService.deleteProduct(id);

    res.json(new ApiResponse(200, 'Product deleted', { product }));
  }

  static async getCategories(req: Request, res: Response) {
    const categories = await ProductService.getCategories();

    res.json(
      new ApiResponse(200, 'All unique categories retrieved successfully', {
        categories,
      })
    );
  }
}
