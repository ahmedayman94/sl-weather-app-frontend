import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WeatherbitApiResponse } from "src/app/shared/models/api-response/weatherbit-api-response.model";
import { SunTimesDataContent } from '../models/sun-time.model';
import { map } from 'rxjs/operators';
import { HourlyOpenWeather, OpenWeatherOneCallApi } from '../models/api-response/openweather-api-response.model';

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
        lat: "59.32932349999999",
        lon: "18.0685808",
        units: "metric",
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

    public getTimeForSunOpenWeather(sunDateObj: Date): SunTimesDataContent {
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

    public fetchOpenWeatherDaily(): Observable<OpenWeatherOneCallApi> {
        const url = environment.localOpenWeatherOpenApiUrl;
        // const url = `http://localhost:5001/sl-weather/api/openweather`;

        const queryParams = {
            ...this.queryParams,
            exclude: 'minutes,hourly',
        }

        return this.httpClient.get<OpenWeatherOneCallApi>(url, { params: queryParams });
    }

    public fetchOpenWeatherHourly(): Observable<HourlyOpenWeather[]> {
        const url = environment.localOpenWeatherOpenApiUrl;
        // const url = `http://localhost:5001/sl-weather/api/openweather`;

        const queryParams = {
            ...this.queryParams,
            exclude: 'minutes,daily',
        }

        return this.httpClient.get<OpenWeatherOneCallApi>(url, { params: queryParams }).pipe(map(res => res?.hourly.slice(0, 10)));
    }
}