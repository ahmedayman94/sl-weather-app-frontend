export interface WeatherInfo {
    time: string;
    temperature: string;
    feelsLike?: string;
    icon: string;
}

export interface WeatherDailyInfo {
    day: string;
    min: string;
    max: string;
    icon: string;
}