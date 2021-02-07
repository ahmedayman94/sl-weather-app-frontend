import { ClimaCellDailyTemperature } from './climacell-daily-temp.model';

export interface ClimacellDailyApResponseData {
    observation_time: { value: string };

    temp: ClimaCellDailyTemperature[];

    feels_like: { value: number, units: string };

    weather_code: { value: string };
}