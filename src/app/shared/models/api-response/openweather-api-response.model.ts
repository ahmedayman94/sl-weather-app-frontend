export interface OpenWeatherOneCallApi {
    current: Current;

    daily?: DailyOpenWeather[];

    hourly?: HourlyOpenWeather[];
}

export interface HourlyOpenWeather {
    dt: number;

    feels_like: number;

    temp: number;

    weather: Weather[]
}

interface Current {
    dt: number;

    sunrise: number;

    sunset: number;

    temp: number;

    feels_like: number;

    weather: Weather[]

}

interface Weather {
    main: string;

    icon: string;
}

interface DailyOpenWeather {
    dt: number;

    feels_like: number;

    temp: TemperatureDetail;

    weather: Weather[]

    sunrise: number;

    sunset: number;
}

interface TemperatureDetail {
    min: number;

    max: number;
}