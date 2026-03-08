interface ApiErrorResponse {
  error?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  errors?: { field: string; message: string }[];

  constructor(message?: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.errors = errors;
  }
}

export async function handleApiError(res: Response) {
  let errorData: ApiErrorResponse;

  try {
    errorData = await res.json();
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }
  throw new ApiError(errorData.error || errorData.message, errorData.errors);
}
