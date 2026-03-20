import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  ne,
  notInArray,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import { db } from '../config/db';
import { orderItemsTable, ordersTable, productsTable } from '../db';
import type { Product } from '../types/product.types';
import { ApiError } from '../utils/api-response';
import type { UpdateProductInput } from '../validations/products.validation';
import { cache } from '../config/redis';

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

      await cache.delPattern('cache:/api/products*');

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

    await cache.delPattern('cache:/api/products*');

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

  static async getPaginatedProducts(
    category: string,
    sort: string,
    page: number,
    limit: number,
    filter?: string,
    search?: string
  ) {
    const parsedLimit = Number(limit) ?? undefined;
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
    if (filter === 'featured')
      conditions.push(eq(productsTable.isFeatured, true));

    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.category, `%${search}%`),
          ilike(productsTable.farm, `%${search}%`)
        )
      );
    }

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
        .select({ ...productCardSelect })
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

  static async getAllProducts() {
    const products = await db
      .select({ ...productCardSelect })
      .from(productsTable);

    return products;
  }

  static async getSuggestedProducts(productIds: string[]) {
    const products = await db
      .select({ ...productCardSelect })
      .from(productsTable)
      .where(notInArray(productsTable.id, productIds))
      .orderBy(sql`RANDOM()`)
      .limit(4);

    return products;
  }

  static async getRelatedProducts(slug: string) {
    const products = await db
      .select({ ...productCardSelect })
      .from(productsTable)
      .where(
        and(
          eq(
            productsTable.category,
            db
              .select({ category: productsTable.category })
              .from(productsTable)
              .where(eq(productsTable.slug, slug))
              .limit(1)
          ),
          ne(
            productsTable.id,
            db
              .select({ id: productsTable.id })
              .from(productsTable)
              .where(eq(productsTable.slug, slug))
              .limit(1)
          )
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(4);

    return products;
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

    await cache.delPattern('cache:/api/products*');

    return updatedProduct;
  }

  static async bestSelling() {
    const bestSelling = await db
      .select({
        ...productCardSelect,
        totalSold: sql<number>`sum(${orderItemsTable.quantity})`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(productsTable, eq(productsTable.id, orderItemsTable.productId))
      .where(notInArray(ordersTable.status, ['cancelled', 'refunded']))
      .groupBy(orderItemsTable.productId, productsTable.id)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(8);

    return bestSelling;
  }

  static async trending() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const trendingProducts = await db
      .select({
        ...productCardSelect,
        totalSold: sql<number>`sum(${orderItemsTable.quantity})`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(productsTable, eq(productsTable.id, orderItemsTable.productId))
      .where(
        and(
          gte(ordersTable.createdAt, threeDaysAgo),
          notInArray(ordersTable.status, ['cancelled', 'refunded'])
        )
      )
      .groupBy(orderItemsTable.productId, productsTable.id)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(8);

    return trendingProducts;
  }
  static async deleteProduct(id: string) {
    const [deletedProduct] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();

    if (!deletedProduct) {
      throw new ApiError(404, 'Product not found');
    }

    await cache.delPattern('cache:/api/products*');

    return deletedProduct;
  }
}

const productCardSelect = {
  id: productsTable.id,
  name: productsTable.name,
  slug: productsTable.slug,
  price: productsTable.price,
  originalPrice: productsTable.originalPrice,
  images: productsTable.images,
  farm: productsTable.farm,
  unit: productsTable.unit,
  stock: productsTable.stock,
  isOrganic: productsTable.isOrganic,
  reviewCount: productsTable.reviewCount,
  rating: productsTable.rating,
  isSeasonal: productsTable.isSeasonal,
  isOnSale: productsTable.isOnSale,
  origin: productsTable.origin,
  inStock: productsTable.inStock,
} as const;
