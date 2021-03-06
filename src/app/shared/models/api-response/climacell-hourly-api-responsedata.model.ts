export interface ClimacellHourlyApResponseData {
    observation_time: { value: string };

    precipitation_probability: { value: number, units: string };

    precipitation_type: { value: string };

    sunrise: { value: string }

    sunset: { value: string };

    temp: { value: number, units: string };

    feels_like: { value: number, units: string };

    weather_code: { value: string };
}