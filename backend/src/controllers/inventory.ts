// import type { Request, Response } from 'express';
// import { InventoryService } from '../services/inventory';
// import { ApiResponse } from '../utils/apiResponse';

// export class InventoryController {
//   static async fetchInventory(req: Request, res: Response) {
//     const productId = req.params.productId as string;

//     const result = await InventoryService.fetchInventory(productId);

//     res.json(new ApiResponse(200, result.message, result.data));
//   }

//   static async updateInventory(req: Request, res: Response) {
//     const id = req.params.productId as string;

//     const result = await InventoryService.updateInventory(id, req.body);

//     res.json(new ApiResponse(200, result.message, result.data));
//   }
// }
