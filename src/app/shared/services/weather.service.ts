import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ClimacellResponseData } from '../models/climacell-responsedata.model';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class WeatherService {
    public readonly iconMapping = {
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

    constructor(
        private httpClient: HttpClient
    ) { }

    // public fetchWeather(hours: number): Observable<WeatherbitApiResponse> {
    //     const url = environment.production ?
    //         `${environment.localWeatherApiUrl}?city=Stockholm&key=${environment.weatherApiKey}&hours=${hours}` :
    //         './assets/weather-mockdata.json';

    //     return this.httpClient.get<WeatherbitApiResponse>(url);
    // }
}