import { and, desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { addressesTable } from '../models/addresses';
import { ApiError } from '../utils/apiResponse';

interface Address {
  firstName: string;
  lastName: string;
  streetAddress: string;
  phone1: string;
  phone2?: string;
  state: string;
  city: string;
}

export class AddressService {
  static async addAddress(userId: string, userAddress: Address) {
    const [existing] = await db
      .select({ isDefault: addressesTable.isDefault })
      .from(addressesTable)
      .where(
        and(
          eq(addressesTable.userId, userId),
          eq(addressesTable.isDefault, true)
        )
      );

    const phone1 = `+234${userAddress.phone1.replace(/[^\d+]/g, '')}`;
    const phone2 = userAddress.phone2
      ? `+234${userAddress.phone2?.replace(/[^\d+]/g, '')}`
      : '';

    const addressMetadata = {
      ...userAddress,
      phone1,
      phone2,
      userId,
      isDefault: !existing ? true : false,
    };

    const [newAddress] = await db
      .insert(addressesTable)
      .values(addressMetadata)
      .returning();

    return { message: 'Address successfully created', newAddress };
  }

  static async getAddress(userId: string) {
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

    // if (addresses.length < 1)
    //   throw new ApiError(404, 'User has no saved address');

    return { message: 'Address successfully retrieved', addresses };
  }

  static async setDefaultAddress(userId: string, addressId: string) {
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

    return;
  }

  static async updateAddress(userId: string, addressId: string, data: Address) {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(
        and(eq(addressesTable.userId, userId), eq(addressesTable.id, addressId))
      );

    if (!existing) {
      throw new ApiError(404, 'Address not found');
    }

    const phone1 = `+234${data.phone1.replace(/[^\d+]/g, '')}`;
    const phone2 = data.phone2
      ? `+234${data.phone2?.replace(/[^\d+]/g, '')}`
      : '';

    const metadata = {
      ...data,
      phone1,
      phone2,
    };

    const [updatedAddress] = await db
      .update(addressesTable)
      .set(metadata)
      .where(eq(addressesTable.id, addressId))
      .returning();

    if (!updatedAddress) {
      throw new ApiError(500, 'Error updating address');
    }

    return;
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
