export class ApiResponse {
    status: number = 0;
    statusText: string = '';
    message: string = '';
    error?: ApiError;
    data: any;
}

export class ApiError {
    code: string = '';
    message: string = '';
    errno?: number;
    call?: string;
}
