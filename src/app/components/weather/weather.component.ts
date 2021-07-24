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

    const climaCellResponse$ = this.clockService.hourlyMark$.pipe(
      switchMap(() => this.weatherService.fetchHourlyWeatherClimacell()),
      retry(3),
      share(),
      catchError(err => {
        this.onError.emit(err)
        throw new Error(err);
      }),
    );

    this.sunTimes$ = climaCellResponse$.pipe(
      map(res =>
      ({
        sunrise: this.weatherService.getTimeForSunClimacell(new Date(res[0].sunrise.value)),
        sunset: this.weatherService.getTimeForSunClimacell(new Date(res[0].sunset.value)),
      })
      )
    );

    this.weatherHourlyInfo$ = climaCellResponse$.pipe(
      map(res =>
        res.map(hourlyRes => {
          const time = new Date(hourlyRes.observation_time.value).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' });
          const temp = Math.round(hourlyRes.temp.value);
          const feelsLikeTemp = Math.round(hourlyRes.feels_like.value);
          const feelsLike = feelsLikeTemp !== temp ? `(${feelsLikeTemp} °C)` : null;
          const icon = this.weatherService.adjustWeatherCodeClimacell(hourlyRes.weather_code.value, hourlyRes.observation_time.value, hourlyRes.sunrise.value, hourlyRes.sunset.value);

          return {
            time,
            temperature: `${temp} °C`,
            feelsLike,
            icon
          };
        })
      ),
    );

    this.weatherDailyInfo$ = this.weatherService.fetchDailyWeatherClimacell()
      .pipe(
        map(res =>
          res.map(w =>
          ({
            ...w,
            day: this.clockService.getDayOfWeek(w.day),
          }))
        ),
      );
  }

  ngOnInit(): void {
  }

  public getImageByCode(code: string, weatherApp: WeatherApp): string {
    let imgLink: string;
    if (weatherApp === WeatherApp.WEATHERBIT) {
      const newImgMapped = this.weatherService.weatherbitIconMapping[code];
      imgLink = newImgMapped ?
        `https://raw.githubusercontent.com/ClimaCell-API/weather-code-icons/79fe6484cd5f9f7a482d7391c12712a1ac1b2602/color/${newImgMapped}` :
        `https://www.weatherbit.io/static/img/icons/${code}.png`;
    } else {
      imgLink = `https://raw.githubusercontent.com/ClimaCell-API/weather-code-icons/79fe6484cd5f9f7a482d7391c12712a1ac1b2602/color/${code}.svg`;
    }

    return imgLink;
  }
}
