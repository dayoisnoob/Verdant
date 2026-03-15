export interface AddressApi {
  id: string;
  firstName: string;
  lastName?: string;
  streetAddress: string;
  phone1: string;
  phone2?: string;
  state: string;
  isDefault: boolean;
}
