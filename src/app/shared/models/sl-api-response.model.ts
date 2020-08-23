import { SLResponseData } from "./sl-responsedata.model";
export interface SLApiResponse {
    StatusCode: number;

    Message: string;

    ResponseData: SLResponseData;
}