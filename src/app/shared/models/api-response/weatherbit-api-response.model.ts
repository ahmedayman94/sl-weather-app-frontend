import { WeatherbitResponseData } from "../weatherbit-responsedata.model";

export interface WeatherbitApiResponse {
    city_name: string;

    country_code: string;

    data: WeatherbitResponseData[];
}