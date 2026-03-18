import { and, desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { addressesTable } from '../models/addresses';
import { ApiError } from '../utils/apiResponse';
import type { AddressForm } from '../validations/address';

const formatNigerianPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return '';

  return `+234${phoneNumber?.replace(/[^\d+]/g, '')}`;
};
export class AddressService {
  static async addAddress(userId: string, userAddress: AddressForm) {
    const [existing] = await db
      .select({ isDefault: addressesTable.isDefault })
      .from(addressesTable)
      .where(
        and(
          eq(addressesTable.userId, userId),
          eq(addressesTable.isDefault, true)
        )
      );

    const phone1 = formatNigerianPhoneNumber(userAddress.phone1);
    const phone2 = formatNigerianPhoneNumber(userAddress.phone2);

    const addressMetadata = {
      ...userAddress,
      phone1,
      phone2,
      userId,
      isDefault: !existing,
    };

    const [address] = await db
      .insert(addressesTable)
      .values(addressMetadata)
      .returning({
        id: addressesTable.id,
        firstName: addressesTable.firstName,
        lastName: addressesTable.lastName,
        phone1: addressesTable.phone1,
        phone2: addressesTable.phone2,
        streetAddress: addressesTable.streetAddress,
        state: addressesTable.state,
        isDefault: addressesTable.isDefault,
      });

    if (!address) {
      throw new ApiError(500, 'Error adding address');
    }
    return address;
  }

  static async getAddresses(userId: string) {
    const addresses = await db
      .select({
        id: addressesTable.id,
        firstName: addressesTable.firstName,
        lastName: addressesTable.lastName,
        streetAddress: addressesTable.streetAddress,
        phone1: addressesTable.phone1,
        phone2: addressesTable.phone2,
        state: addressesTable.state,
        isDefault: addressesTable.isDefault,
      })
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(desc(addressesTable.isDefault));

    return addresses;
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    const [address] = await db
      .select()
      .from(addressesTable)
      .where(
        and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId))
      );

    if (!address) throw new ApiError(404, 'Address not found');

    await db.transaction(async (tx) => {
      await tx
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId));

      await tx
        .update(addressesTable)
        .set({ isDefault: true })
        .where(
          and(
            eq(addressesTable.id, addressId),
            eq(addressesTable.userId, userId)
          )
        );
    });
  }

  static async updateAddress(
    userId: string,
    addressId: string,
    data: AddressForm
  ) {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(
        and(eq(addressesTable.userId, userId), eq(addressesTable.id, addressId))
      );

    if (!existing) {
      throw new ApiError(404, 'Address not found');
    }

    const phone1 = formatNigerianPhoneNumber(data.phone1);
    const phone2 = formatNigerianPhoneNumber(data.phone2);

    const metadata = {
      ...data,
      phone1,
      phone2,
    };

    const [updatedAddress] = await db
      .update(addressesTable)
      .set(metadata)
      .where(
        and(eq(addressesTable.userId, userId), eq(addressesTable.id, addressId))
      )
      .returning();

    if (!updatedAddress) {
      throw new ApiError(500, 'Error updating address');
    }
  }

  static async removeAddress(userId: string, addressId: string) {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(
        and(eq(addressesTable.userId, userId), eq(addressesTable.id, addressId))
      );

    if (!existing) {
      throw new ApiError(404, 'Address not found');
    }

    if (existing.isDefault) {
      const addresses = await AddressService.getAddresses(userId);
      const newDefault =
        addresses && addresses.filter((a) => a.isDefault === false)[0];

      if (newDefault) {
        await db
          .update(addressesTable)
          .set({ isDefault: true })
          .where(eq(addressesTable.id, newDefault.id));
      }
    }

    const [removedAddress] = await db
      .delete(addressesTable)
      .where(eq(addressesTable.id, addressId))
      .returning();

    if (!removedAddress) {
      throw new ApiError(500, 'Error deleting address');
    }

    return;
  }
}
