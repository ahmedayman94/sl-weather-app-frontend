import { EventEmitter } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry, share, switchMap } from 'rxjs/operators';
import { WeatherApp } from 'src/app/shared/models/misc';
import { SunTimes } from 'src/app/shared/models/sun-time.model';
import { WeatherDailyInfo, WeatherInfo as WeatherHourlyInfo } from 'src/app/shared/models/weather-info.model';
import { ClockService } from 'src/app/shared/services/clock.service';
import { WeatherService } from 'src/app/shared/services/weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  @Output('onWeatherError') onError = new EventEmitter<any>();

  public sunImages: { sunrise: string; sunset: string; };

  public weatherApp = WeatherApp.CLIMACELL;

  public weatherHourlyInfo$: Observable<WeatherHourlyInfo[]>;

  public weatherDailyInfo$: Observable<WeatherDailyInfo[]>;

  public sunTimes$: Observable<SunTimes>;

  constructor(private weatherService: WeatherService, private clockService: ClockService) {
    this.sunImages = this.weatherService.sunImages;

    const openWeatherResponseDaily$ = this.weatherService.fetchOpenWeatherDaily()
      .pipe(share());

    this.sunTimes$ = openWeatherResponseDaily$.pipe(
      map(res => res.daily[1]), // Tommorow's sunrise/sunset time
      map(res =>
      ({
        sunrise: this.weatherService.getTimeForSunOpenWeather(new Date(res.sunrise * 1000)),
        sunset: this.weatherService.getTimeForSunOpenWeather(new Date(res.sunset * 1000)),
      })
      )
    );

    this.weatherHourlyInfo$ = this.weatherService.fetchOpenWeatherHourly()
      .pipe(
        map(res =>
          res.map(w => {
            const feelsLikeTemp = Math.round(w.feels_like)
            const feelsLike = feelsLikeTemp !== w.temp ? `(${feelsLikeTemp} °C)` : null;

            return ({
              time: new Date(w.dt * 1000).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' }),
              temperature: `${Math.round(w.temp)} °C`,
              feelsLike,
              icon: w.weather[0].icon,
            })
          }
          ))
      )

    this.weatherDailyInfo$ = openWeatherResponseDaily$
      .pipe(
        map(res => res.daily),
        map(res =>
          res.map(w =>
          ({
            min: `${Math.round(w.temp.min)}`,
            max: `${Math.round(w.temp.max)}`,
            day: this.clockService.getDayOfWeek(new Date(w.dt * 1000).getDay()),
            icon: w.weather[0].icon,
          }))
        ),
      );
  }

  ngOnInit(): void {
  }

  public getImageByCode(code: string, weatherApp: WeatherApp): string {
    return `https://openweathermap.org/img/wn/${code}@4x.png`;
  }
}
