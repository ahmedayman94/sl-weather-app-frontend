import { ClimacellApiResponse } from './climacell-api-response.model';

export interface ClimacellResponseData {
    lat: number;
    lon: number;
    observation_time: { value: string };
    precipitation_probability: { units: string, value: number };
    precipitation_type: { value: string };
    sunrise: { value: string };
    sunset: { value: string };
    temp: { value: number; units: string };
    weather_code: { value: string };
}