import type { Request, Response } from 'express';
import { AddressService } from '../services/address.service';
import { ApiResponse } from '../utils/api-response';

export class AddressController {
  static async addAddress(req: Request, res: Response) {
    const userId = req.user!.id;

    const address = await AddressService.addAddress(userId, req.body);
    res.json(new ApiResponse(200, 'Address added successfully', { address }));
  }

  static async getAddress(req: Request, res: Response) {
    const userId = req.user!.id;

    const addresses = await AddressService.getAddresses(userId);
    res.json(
      new ApiResponse(200, 'Addresses retrieved successfully', { addresses })
    );
  }

  static async setDefaultAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.params;

    await AddressService.setDefaultAddress(userId, addressId as string);
    res.json(new ApiResponse(200, 'Default address updated'));
  }

  static async updateAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.params;

    await AddressService.updateAddress(userId, addressId as string, req.body);
    res.json(new ApiResponse(200, 'Address updated successfully'));
  }

  static async removeAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId } = req.params;

    await AddressService.removeAddress(userId, addressId as string);
    res.json(new ApiResponse(200, 'Address removed successfully'));
  }
}
