import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WeatherbitApiResponse } from "src/app/shared/models/api-response/weatherbit-api-response.model";
import { SunTimesDataContent } from '../models/sun-time.model';
import { map, tap } from 'rxjs/operators';
import { DailyOpenWeather, HourlyOpenWeather, OpenWeatherOneCallApi } from '../models/api-response/openweather-api-response.model';
import { ClockService } from './clock.service';

@Injectable({ providedIn: 'root' })
export class WeatherService {
    sunImages = {
        sunrise: "./assets/img/sunrise.png",
        sunset: "./assets/img/sunset.png"
    }

    private queryParams = {
        lat: "59.32932349999999",
        lon: "18.0685808",
        units: "metric",
    };

    constructor(
        private httpClient: HttpClient,
        private clockService: ClockService,
    ) { }

    fetchWeatherWeatherbit(hours: number): Observable<WeatherbitApiResponse> {
        const url = environment.production ?
            `${environment.localWeatherApiUrl}?city=Stockholm&hours=${hours}` :
            environment.localWeatherApiUrl;

        return this.httpClient.get<WeatherbitApiResponse>(url);
    }

    getTimeForSunOpenWeather(sunDateObj: Date): SunTimesDataContent {
        return {
            comparisonValues: { hours: sunDateObj.getHours(), minutes: sunDateObj.getMinutes() },
            time: this.clockService.getTimeFormatFromDate(sunDateObj),
        };
    }

    adjustWeatherCodeClimacell(weatherCode: string, observationTimeStr?: string, sunriseTimeStr?: string, sunsetTimeStr?: string): string {
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

    fetchOpenWeatherDaily(): Observable<DailyOpenWeather[]> {
        const url = environment.localOpenWeatherOpenApiUrl;
        // const url = `http://localhost:5001/sl-weather/api/openweather`;

        const queryParams = {
            ...this.queryParams,
            exclude: 'minutely,hourly',
        };

        return this.httpClient.get<OpenWeatherOneCallApi>(url, { params: queryParams }).pipe(
            tap(res => {
                if (res == null || res.daily == null) throw new Error('Couldnt fetch weather');
            }),
            map(res => res.daily)
        );
    }

    fetchOpenWeatherHourly(): Observable<HourlyOpenWeather[]> {
        const url = environment.localOpenWeatherOpenApiUrl;
        // const url = `http://localhost:5001/sl-weather/api/openweather`;

        const queryParams = {
            ...this.queryParams,
            exclude: 'minutes,daily',
        };

        return this.httpClient.get<OpenWeatherOneCallApi>(url, { params: queryParams }).pipe(map(res => res?.hourly.slice(0, 10)));
    }
}