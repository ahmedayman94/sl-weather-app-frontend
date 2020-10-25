export interface SunTimes {
    sunrise: SunTimesDataContent;
    sunset: SunTimesDataContent;
}

export interface SunTimesDataContent {
    comparisonValues: { hours: number, minutes: number };

    time: string;
}