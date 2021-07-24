import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WeatherbitApiResponse } from "src/app/shared/models/api-response/weatherbit-api-response.model";
import { ClimacellHourlyApResponseData } from "src/app/shared/models/api-response/climacell-hourly-api-responsedata.model";
import { SunTimesDataContent } from '../models/sun-time.model';
import { ClimacellDailyApResponseData } from '../models/api-response/climacell-daily-api-responsedata.model';
import { map } from 'rxjs/operators';
import { WeatherWeekForecast } from '../models/weather-week-forecast.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
    public get weatherbitIconMapping() {
        return {
            "c01d": "clear_day.svg",
            "c01n": "clear_night.svg",
            "c02d": "partly_cloudy_day.svg",
            "c02n": "partly_cloudy_night.svg",
            "c03d": "partly_cloudy_day.svg",
            "c03n": "partly_cloudy_night.svg",
            "c04d": "mostly_cloudy.svg",
            "c04n": "mostly_cloudy.svg",
            // "u00d": "rain.svg",
            // "u00n": "rain.svg",
            // "t01d": "tstorm.svg",
            // "t01n": "tstorm.svg"
        };
    }

    public get sunImages() {
        return {
            sunrise: "./assets/img/sunrise.png",
            sunset: "./assets/img/sunset.png"
        }
    }

    private queryParams = {
        fields: "temp,feels_like,precipitation_type,precipitation_probability,sunrise,sunset,weather_code",
        lat: "59.32932349999999",
        lon: "18.0685808",
        unit_system: "si"
    };

    constructor(
        private httpClient: HttpClient
    ) { }

    public fetchWeatherWeatherbit(hours: number): Observable<WeatherbitApiResponse> {
        const url = environment.production ?
            `${environment.localWeatherApiUrl}?city=Stockholm&hours=${hours}` :
            environment.localWeatherApiUrl;

        return this.httpClient.get<WeatherbitApiResponse>(url);
    }

    public fetchHourlyWeatherClimacell(): Observable<ClimacellHourlyApResponseData[]> {
        const startTimeDate = new Date();
        const endTimeDate = new Date(startTimeDate.getTime() + 60 * 60 * 1000 * 8);
        const startTime = startTimeDate.toISOString();
        const endTime = endTimeDate.toISOString();

        const url = environment.localClimacellHourlyApiUrl;
        const queryParams = {
            ...this.queryParams,
            start_time: startTime,
            end_time: endTime
        };

        return this.httpClient.get<ClimacellHourlyApResponseData[]>(url, { params: queryParams });
    }

    public fetchDailyWeatherClimacell(): Observable<WeatherWeekForecast[]> {
        const now = new Date();
        const startTimeMilliseconds = new Date().setDate(now.getDate() + 1);
        const endTimeMilliseconds = new Date().setDate(now.getDate() + 6);

        const startDate = new Date(startTimeMilliseconds).toISOString();
        const endDate = new Date(endTimeMilliseconds).toISOString();

        const url = environment.localClimacellDailyApiUrl;
        const queryParams = {
            ...this.queryParams,
            fields: "temp,sunrise,sunset,weather_code",
            start_time: startDate,
            end_time: endDate
        };

        return this.httpClient.get<ClimacellDailyApResponseData[]>(url, { params: queryParams })
            .pipe(map(res => {
                const responseData: WeatherWeekForecast[] = res.map(data => {
                    const minTemp = data.temp.find(t => t.min != null);
                    const maxTemp = data.temp.find(t => t.max != null);

                    return {
                        day: new Date(data.observation_time.value).getDay(),
                        min: `${Math.round(minTemp.min.value)} °C`,
                        max: `${Math.round(maxTemp.max.value)} °C`,
                        icon: this.adjustWeatherCodeClimacell(data.weather_code.value)
                    };
                });

                return responseData;
            }));
    }

    public getTimeForSunClimacell(sunDateObj: Date): SunTimesDataContent {
        return {
            comparisonValues: { hours: sunDateObj.getHours(), minutes: sunDateObj.getMinutes() },
            time: sunDateObj.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
        };
    }

    public adjustWeatherCodeClimacell(weatherCode: string, observationTimeStr?: string, sunriseTimeStr?: string, sunsetTimeStr?: string): string {
        if (weatherCode !== "partly_cloudy" && weatherCode !== "mostly_clear" && weatherCode !== "clear")
            return weatherCode;

        if (observationTimeStr == null) return `${weatherCode}_day`;

        const observationHours = new Date(observationTimeStr).getUTCHours();
        const sunsetHour = new Date(sunsetTimeStr).getUTCHours();
        const sunriseHour = new Date(sunriseTimeStr).getUTCHours();

        // Case of climacell returning only partly_cloudy, and mostly_clear we need to define day or night since we don't have an image for just cloudy
        if (observationHours > sunriseHour && observationHours < sunsetHour) {
            return weatherCode + "_day";
        } else {
            return weatherCode + "_night";
        }
    }
}