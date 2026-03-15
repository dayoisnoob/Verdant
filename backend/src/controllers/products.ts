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

  static async getPaginatedProducts(req: Request, res: Response) {
    const { category, sort, page, limit, filter, search } = req.parsedQuery as {
      category: string;
      sort: string;
      page: number;
      limit: number;
      filter: string;
      search: string;
    };

    const result = await ProductService.getPaginatedProducts(
      category as string,
      sort as string,
      page,
      limit,
      filter as string,
      search as string
    );

    res.json(
      new ApiResponse(200, 'Products fetched', {
        products: result.products,
        pagination: result.pagination,
      })
    );
  }

  static async getAllProducts(req: Request, res: Response) {
    const products = await ProductService.getAllProducts();

    res.json(new ApiResponse(200, 'Products fetched', { products }));
  }

  static async getSuggestedProducts(req: Request, res: Response) {
    const { productIds } = req.body;
    const products = await ProductService.getSuggestedProducts(productIds);

    res.json(new ApiResponse(200, 'Products fetched', { products }));
  }
  static async getRelatedProducts(req: Request, res: Response) {
    const { slug } = req.params;
    const products = await ProductService.getRelatedProducts(slug as string);

    res.json(new ApiResponse(200, 'Products fetched', { products }));
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

  static async bestSelling(req: Request, res: Response) {
    const bestSelling = await ProductService.bestSelling();

    res.json(
      new ApiResponse(200, 'Best selling products retrieved successfully', {
        bestSelling,
      })
    );
  }
  static async trending(req: Request, res: Response) {
    const trending = await ProductService.trending();

    res.json(
      new ApiResponse(200, 'Trending products retrieved successfully', {
        trending,
      })
    );
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
