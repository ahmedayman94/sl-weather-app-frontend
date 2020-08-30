import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WeatherbitApiResponse } from "src/app/shared/models/weatherbit-api-response.model";

@Injectable({ providedIn: 'root' })
export class WeatherService {
    constructor(
        private httpClient: HttpClient
    ) { }

    public fetchWeather(hours: number): Observable<WeatherbitApiResponse> {
        return this.httpClient.get<WeatherbitApiResponse>(`${environment.localWeatherApiUrl}?city=Stockholm&key=${environment.weatherApiKey}&hours=${hours}`);
    }
}