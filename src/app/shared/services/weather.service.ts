import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WeatherService {
    constructor(
        private httpClient: HttpClient
    ) { }

    public fetchWeather(hours: number): Observable<any> {
        return this.httpClient.get<any>(`${environment.localWeatherApiUrl}?city=Stockholm&key=${environment.weatherApiKey}&hours=${hours}`);
    }
}