export interface APIErrorResponse {
  code?: string;
  message?: string;
  error?: string;
}

export class APIError extends Error {
  public status: number;
  public data?: APIErrorResponse;

  constructor(status: number, message: string, data?: APIErrorResponse) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}
