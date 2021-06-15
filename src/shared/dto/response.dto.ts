
export class RequestDto {
    message: string;
    status: string;
    data: object;
}

export class ResponseDto {
    message: string;
    status: string;
    data: object;
    token?: string;
}
