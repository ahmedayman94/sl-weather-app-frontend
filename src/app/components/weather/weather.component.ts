import { EventEmitter } from '@angular/core';
import { Component, Output } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { catchError, filter, map, mergeMap, retry, retryWhen, share, switchMap, tap } from 'rxjs/operators';
import { ErrorModel } from 'src/app/shared/models/error.model';
import { SunTimes } from 'src/app/shared/models/sun-time.model';
import { WeatherDailyInfo, WeatherInfo as WeatherHourlyInfo } from 'src/app/shared/models/weather-info.model';
import { ClockService } from 'src/app/shared/services/clock.service';
import { WeatherService } from 'src/app/shared/services/weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {

  @Output('onWeatherError') onError = new EventEmitter<ErrorModel>();

  public sunImages: { sunrise: string; sunset: string; };

  public weatherHourlyInfo$: Observable<WeatherHourlyInfo[]>;

  public weatherDailyInfo$: Observable<WeatherDailyInfo[]>;

  public sunTimes$: Observable<SunTimes>;

  private _initiated = false;

  constructor(private weatherService: WeatherService, private clockService: ClockService) {
    this.sunImages = this.weatherService.sunImages;


    const openWeatherResponseDaily$ = this.clockService.hourlyMark$.pipe(
      filter(() => !this._initiated || new Date().getHours() === 20),
      tap(() => this._initiated = true),
      switchMap(() => this.weatherService.fetchOpenWeatherDaily()
        .pipe(
          retryWhen(this.retryStrategy()),
          catchError(err => {
            this.onError.next({ message: 'couldnt fetch the daily weather', color: 'red' });
            return [];
          })),
      ),
      share(),
    );

    this.sunTimes$ = openWeatherResponseDaily$.pipe(
      map(dailyRes => dailyRes[1]), // Tommorow's sunrise/sunset time
      map(res =>
      ({
        sunrise: this.weatherService.getTimeForSunOpenWeather(new Date(res.sunrise * 1000)),
        sunset: this.weatherService.getTimeForSunOpenWeather(new Date(res.sunset * 1000)),
      })
      ),
    );

    this.weatherHourlyInfo$ = this.clockService.hourlyMark$.pipe(
      switchMap(() => this.weatherService.fetchOpenWeatherHourly()),
      tap(() => this.onError.next(null)),
      map(res =>
        res.map(w => {
          const temperature = Math.round(w.temp);
          const feelsLikeTemp = Math.round(w.feels_like)
          const feelsLike = Math.abs(feelsLikeTemp - temperature) > 1 ? `(${feelsLikeTemp} °C)` : null;

          return ({
            time: this.clockService.getTimeFormatFromDate(new Date(w.dt * 1000)),
            temperature: `${temperature} °C`,
            feelsLike,
            icon: this.getImageByCode(w.weather[0].icon),
          });
        }
        )),
      retryWhen(this.retryStrategy()),
      catchError(err => {
        this.onError.next({ message: 'couldnt fetch the hourly weather', color: 'red' });
        return [];
      }),
    );

    this.weatherDailyInfo$ = openWeatherResponseDaily$
      .pipe(
        map(res =>
          res.map((w, idx) =>
          ({
            min: `${Math.round(w.temp.min)}`,
            max: `${Math.round(w.temp.max)}`,
            day: idx === 0 ? 'Today' : this.clockService.getDayOfWeek(new Date(w.dt * 1000).getDay()),
            icon: this.getImageByCode(w.weather[0].icon),
          }))
        ),
      );
  }

  private getImageByCode(code: string): string {
    return `https://openweathermap.org/img/wn/${code}@4x.png`;
  }

  private retryStrategy(): (attempts: Observable<any>) => (Observable<any>) {
    const slowerDelayTime = 60000 * 10; // Delay time of 10 minutes

    return (attempts: Observable<any>) =>
      attempts.pipe(
        mergeMap((errors, _) => {
          this.handleError(slowerDelayTime);
          return timer(slowerDelayTime);
        }),
      );
  }

  private handleError(timeDelayMs: number) {
    const now = new Date();
    const time = this.clockService.getTimeFormatFromDate(new Date(now.getTime() + timeDelayMs));
    this.onError.next({ color: 'orange', message: `Couldnt fetch weather, retrying to fetch again at ${time}` });
  }
}
