import type { Request, Response } from 'express';
import { AddressService } from '../services/address';
import { ApiResponse } from '../utils/apiResponse';

export class AddressController {
  static async addAddress(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AddressService.addAddress(userId, req.body);
    res.json(new ApiResponse(200, result.message, result.newAddress));
  }

  static async getAddress(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AddressService.getAddress(userId);
    res.json(new ApiResponse(200, result.message, result.addresses));
  }

  static async setDefaultAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.params;

    const result = await AddressService.setDefaultAddress(
      userId,
      addressId as string
    );
    res.json(new ApiResponse(200, result.message));
  }

  static async updateAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.query;

    const result = await AddressService.updateAddress(
      userId,
      addressId as string,
      req.body
    );
    res.json(new ApiResponse(200, 'Address successfully updated'));
  }
}
