import { and, asc, desc, eq, inArray, SQL, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { productsTable } from '../models';
import type { Product } from '../types/types';
import { ApiError } from '../utils/apiResponse';
import type { UpdateProductInput } from '../validations/products';

export class ProductService {
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

      return { count: newProducts.length, products: newProducts };
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

    return { count: 1, product: newProduct };
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

    return product;
  }

  static async getProducts(
    category: string,
    sort: string,
    page: number,
    limit: number,
    filter?: string
  ) {
    const parsedLimit = Number(limit) || 12;
    const parsedPage = Number(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const normalisedCategory = category
      ? category.at(0)?.toUpperCase() + category.slice(1)
      : 'All';

    const conditions = [];
    if (normalisedCategory && normalisedCategory !== 'All')
      conditions.push(eq(productsTable.category, normalisedCategory));

    if (filter === 'organic')
      conditions.push(eq(productsTable.isOrganic, true));
    if (filter === 'seasonal')
      conditions.push(eq(productsTable.isSeasonal, true));
    if (filter === 'on-sale') conditions.push(eq(productsTable.isOnSale, true));
    if (filter === 'in-stock') conditions.push(eq(productsTable.inStock, true));

    const sortMap: Record<string, SQL> = {
      'price-asc': asc(productsTable.price),
      'price-desc': desc(productsTable.price),
      'name-asc': asc(productsTable.name),
      newest: desc(productsTable.createdAt),
    };

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy: SQL = sortMap[sort] ?? desc(productsTable.createdAt);

    const [products, countResult] = await Promise.all([
      db
        .select()
        .from(productsTable)
        .where(where)
        .orderBy(orderBy)
        .limit(parsedLimit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where),
    ]);

    const totalItems = Number(countResult[0]?.count ?? 0);
    const pagination = {
      totalItems,
      currentPage: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalItems / parsedLimit),
    };

    return { products, pagination };
  }

  static async getCategories() {
    const categories = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable)
      .orderBy(productsTable.category);

    const uniqueCategories = categories.map((p) => p.category);

    return uniqueCategories;
  }

  static async updateProduct(id: string, updateData: UpdateProductInput) {
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'No fields provided to update');
    }

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updatedProduct) {
      throw new ApiError(404, 'Product not found');
    }

    return updatedProduct;
  }

  static async deleteProduct(id: string) {
    const [deletedProduct] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();

    if (!deletedProduct) {
      throw new ApiError(404, 'Product not found');
    }

    return deletedProduct;
  }
}
