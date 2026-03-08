// import { eq } from 'drizzle-orm';
// import { db } from '../config/db';
// import { inventoryTable } from '../models';
// import { ApiError } from '../utils/apiResponse';
// import type { UpdateInventoryInput } from '../validations/products';

// export class InventoryService {
//   static async fetchInventory(productId: string) {
//     const [product] = await db
//       .select()
//       .from(inventoryTable)
//       .where(eq(inventoryTable.productId, productId))
//       .limit(1);

//     if (!product) {
//       throw new ApiError(
//         404,
//         'Product not found. It may have been removed or the link is incorrect.'
//       );
//     }

//     return { message: 'Inventory retrieved successfully.', data: product };
//   }

//   static async updateInventory(
//     productId: string,
//     updateData: UpdateInventoryInput
//   ) {
//     const [existing] = await db
//       .select({ id: inventoryTable.id })
//       .from(inventoryTable)
//       .where(eq(inventoryTable.productId, productId))
//       .limit(1);

//     if (!existing) {
//       throw new ApiError(404, 'Product not found');
//     }

//     if (Object.keys(updateData).length === 0) {
//       throw new ApiError(400, 'No fields provided to update');
//     }

//     const [updatedProduct] = await db
//       .update(inventoryTable)
//       .set(updateData)
//       .where(eq(inventoryTable.productId, productId))
//       .returning();

//     if (!updatedProduct) {
//       throw new ApiError(500, 'Failed to update product. Please try again.');
//     }

//     return { message: 'Product updated successfully', data: updatedProduct };
//   }
// }
