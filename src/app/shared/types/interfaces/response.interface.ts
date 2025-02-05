import { ResponseMessage } from "../enums/response-messages.enum";

export interface IResponse<T = any> {
    status: boolean;
    error?: ResponseMessage;
    value?: T
}

