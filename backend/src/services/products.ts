import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { productsTable } from '../models';
import type { Product } from '../types/types';
import { ApiError } from '../utils/apiResponse';
// import { skuGenerator } from '../utils/helpers';
import type { UpdateProductInput } from '../validations/products';

export class ProductService {
  static async getProducts(
    category: string,
    sort: string,
    page: number,
    limit: number
  ) {
    const parsedLimit = Number(limit) || 8;
    const parsedPage = Number(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const conditions = [];
    if (category && category !== 'All')
      conditions.push(eq(productsTable.category, category));

    const sortMap: Record<string, any> = {
      'price-asc': asc(productsTable.price),
      'price-desc': desc(productsTable.price),
      'name-asc': asc(productsTable.name),
      newest: desc(productsTable.createdAt),
    };

    const products = await db
      .select()
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortMap[sort] ?? sortMap['newest'])
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalItems = Number(countResult[0]?.count ?? 0);
    const pagination = {
      totalItems,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };

    return {
      message: 'Products fetched successfully',
      data: products,
      pagination,
    };
  }

  static async getProductBySlug(slug: string) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug))
      .limit(1);

    if (!product) {
      throw new ApiError(
        404,
        'Product not found. It may have been removed or the link is incorrect.'
      );
    }

    return { message: 'Product retrieved successfully.', data: product };
  }

  static async createProduct(data: Product | Product[]) {
    if (Array.isArray(data)) {
      const slugs = data.map((d) => d.slug);
      const uniqueSlugs = new Set(slugs);
      if (uniqueSlugs.size !== slugs.length) {
        throw new ApiError(409, 'Duplicate slugs found in the request..');
      }

      const existing = await db
        .select({ slug: productsTable.slug })
        .from(productsTable)
        .where(inArray(productsTable.slug, slugs));

      if (existing.length > 0) {
        const existingSlugs = existing.map((d) => d.slug).join(', ');
        throw new ApiError(409, `These slugs already exist: ${existingSlugs}`);
      }

      const newProducts = await db
        .insert(productsTable)
        .values(data)
        .returning();

      if (!newProducts) {
        throw new ApiError(500, 'Failed to create products. Please try again.');
      }

      return {
        message: 'Products created successfully',
        data: {
          count: newProducts.length,
        },
      };
    }

    const [existing] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, data.slug))
      .limit(1);

    if (existing) {
      throw new ApiError(
        409,
        'A product with this slug already exists. Please use a unique slug.'
      );
    }

    const [newProduct] = await db
      .insert(productsTable)
      .values({ ...data, inStock: true })
      .returning();

    if (!newProduct) {
      throw new ApiError(500, 'Failed to create product. Please try again.');
    }

    return { message: 'Product created successfully', data: newProduct };
  }

  static async updateProduct(id: string, updateData: UpdateProductInput) {
    const [existing] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'No fields provided to update');
    }

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updatedProduct) {
      throw new ApiError(500, 'Failed to update product. Please try again.');
    }

    return { message: 'Product updated successfully', data: updatedProduct };
  }

  static async deleteProduct(id: string) {
    const [existing] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    const [deletedProduct] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();

    if (!deletedProduct) {
      throw new ApiError(500, 'Failed to delete product. Please try again.');
    }

    return { message: 'Product deleted successfully', data: deletedProduct };
  }
}
