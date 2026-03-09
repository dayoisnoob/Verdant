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

    await AddressService.setDefaultAddress(userId, addressId as string);
    res.json(new ApiResponse(200, 'Default address updated'));
  }

  static async updateAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.query;

    await AddressService.updateAddress(userId, addressId as string, req.body);
    res.json(new ApiResponse(200, 'Address successfully updated'));
  }

  static async removeAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.query;

    await AddressService.removeAddress(userId, addressId as string);
    res.json(new ApiResponse(200, 'Address successfully removed'));
  }
}
