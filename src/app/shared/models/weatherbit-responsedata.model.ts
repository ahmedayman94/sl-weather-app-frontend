import { WeatherbitWeather } from "./weatherbit-weather.model";

export interface WeatherbitResponseData {
    datetime: string;

    timestamp_local: string;

    weather: WeatherbitWeather;

    temp: number;
}