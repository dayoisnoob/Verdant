interface ApiErrorResponse {
  statusCode: number;
  error?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    message?: string,
    errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.statusCode = statusCode;
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
  throw new ApiError(
    res.status,
    errorData.error || errorData.message,
    errorData.errors,
  );
}
