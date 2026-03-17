import { UnavailableItem } from "@/components/unavailableItemModal";

interface ApiErrorResponse {
  statusCode: number;
  error?: string;
  message?: string;
  details?: UnavailableItem[];
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];
  details?: UnavailableItem[];

  constructor(
    statusCode: number,
    message?: string,
    errors?: { field: string; message: string }[],
    details?: UnavailableItem[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.details = details;
  }
}

export async function handleApiError(res: Response) {
  let errorData: ApiErrorResponse;

  try {
    errorData = await res.json();
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }
  throw new ApiError(
    res.status,
    errorData.error || errorData.message,
    errorData.errors,
    errorData.details,
  );
}
