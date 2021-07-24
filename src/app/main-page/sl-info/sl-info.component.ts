import { Component, OnInit, OnDestroy } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { timer, merge, Observable, Subscription, forkJoin } from 'rxjs';
import { switchMap, retryWhen, mergeMap, map, retry, skip } from 'rxjs/operators';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { ClockService } from 'src/app/shared/services/clock.service';
import { QuoteService } from 'src/app/shared/services/quote.service';
import { GeneralService } from 'src/app/shared/services/general.service';
import { SunTimes } from 'src/app/shared/models/sun-time.model';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

enum Application {
  SL,
  WEATHERBIT,
  CLIMACELL
}

enum WeatherApp {
  WEATHERBIT,
  CLIMACELL
}

@Component({
  selector: 'app-sl-info',
  templateUrl: './sl-info.component.html',
  styleUrls: ['./sl-info.component.css']
})
export class SlInfoComponent implements OnInit, OnDestroy {
  public transportationTimes = {
    bus: { boardTime: "", latestUpdate: "" },
    metro: { boardTime: "", latestUpdate: "" }
  };
  public sunTime: SunTimes;
  public weatherInfo: { time: string; temperature: string, feelsLike?: string, icon: string }[] = [];
  public weatherDaily: { day: string, min: string, max: string }[] = [];
  public errorSlObj = { message: "", color: "red", counter: 0 };
  public errorWeatherObj = { message: "", color: "red" };

  /**
   * Choose the weather api
   */
  public weatherApp = WeatherApp.CLIMACELL;

  private subscriptions: Subscription[] = [];
  private application = ["SL", "Weatherbit", "Climacell"];
  public readonly sunImages;

  constructor(
    private slService: SLService,
    private weatherService: WeatherService,
    private clockService: ClockService,
  ) {
    this.sunImages = this.weatherService.sunImages;
  }

  ngOnInit() {
    this.subscriptions = [
      this.getWeatherHourlyApiSub(),
      this.getWeatherDailyApiSub(),
      this.getSlApiSub(),
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  private getSlApiSub(): Subscription {
    return this.clockService.minuteMark$.pipe(
      switchMap(() => forkJoin([this.slService.fetchNextTransportationTime(Stations.TESSIN_PARKEN), this.slService.fetchNextTransportationTime(Stations.GARDET_TUNNEL_BANA)])),
      retryWhen(this.retryStrategy())
    )
      .subscribe(
        ([busRes, metroRes]) => {
          this.errorSlObj.counter = 0; // Reset error counter
          this.errorSlObj.message = "";
          this.transportationTimes.metro = {
            boardTime: this.slService.getStrListOfNextArrivals(metroRes.ResponseData.Metros),
            latestUpdate: (new Date(metroRes.ResponseData.LatestUpdate)).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
          };
          this.transportationTimes.bus = {
            boardTime: this.slService.getStrListOfNextArrivals(busRes.ResponseData.Buses),
            latestUpdate: (new Date(busRes.ResponseData.LatestUpdate)).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
          };
        },
        err => console.error(err)
      );
  }

  private getWeatherHourlyApiSub(): Subscription {
    let sub: Subscription;

    if (this.weatherApp === WeatherApp.WEATHERBIT) {
      sub = this.clockService.hourlyMark$.pipe(
        switchMap(() => this.weatherService.fetchWeatherWeatherbit(8)),
        retry(3),
        map(res => res.data)
      ).subscribe(res => {
        for (let i = 0; i < res.length; i++) {
          const data = res[i];
          this.weatherInfo[i] = {
            time: new Date(data.timestamp_local).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' }),
            temperature: `${Math.round(data.temp)} °C`,
            icon: data.weather.icon
          };
        }
      },
        err => this.handleError(Application.WEATHERBIT, err));
    } else {
      sub = this.clockService.hourlyMark$.pipe(
        switchMap(() => this.weatherService.fetchHourlyWeatherClimacell()),
        retry(3)
      ).subscribe(res => {
        const sunDateObjs = {
          sunriseDateObj: new Date(res[0].sunrise.value),
          sunsetDateObj: new Date(res[0].sunset.value)
        };

        this.sunTime = {
          sunrise: this.weatherService.getTimeForSunClimacell(sunDateObjs.sunriseDateObj),
          sunset: this.weatherService.getTimeForSunClimacell(sunDateObjs.sunsetDateObj)
        };

        for (let i = 0; i < res.length; i++) {
          const data = res[i];

          const temp = Math.round(data.temp.value);
          const feelsLikeTemp = Math.round(data.feels_like.value);
          const feelsLike = feelsLikeTemp !== temp ? `(${feelsLikeTemp} °C)` : null;

          this.weatherInfo[i] = {
            time: new Date(data.observation_time.value).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' }),
            temperature: `${temp} °C`,
            feelsLike,
            icon: this.weatherService.adjustWeatherCodeClimacell(data.weather_code.value, data.observation_time.value, data.sunrise.value, data.sunset.value)
          };
        }
      },
        err => this.handleError(Application.CLIMACELL, err));
    }

    return sub;
  }

  private getWeatherDailyApiSub(): Subscription {
    return this.weatherService.fetchDailyWeatherClimacell()
      .subscribe(res => {
        this.weatherDaily = res.map(w => {
          return {
            ...w,
            day: this.clockService.getDayOfWeek(w.day),
          };
        });
      });
  }

  private retryStrategy(): (attempts: Observable<any>) => (Observable<any>) {
    const maxSlowerRetryTimes = 15, // Slower retry that runs every 10 minutes
      maxRetryTimes = 5,
      delayTime = 15000,
      slowerDelayTime = 60000 * 10; // Delay time of 10 minutes

    return (attempts: Observable<any>) => {
      return attempts.pipe(
        mergeMap((errors, _) => {
          this.errorSlObj.counter += 1;
          if (this.errorSlObj.counter > maxRetryTimes) {
            if (this.errorSlObj.counter > maxSlowerRetryTimes) {
              this.handleError(Application.SL, errors);
            } else {
              this.handleError(Application.SL, errors, slowerDelayTime);
              return timer(slowerDelayTime);
            }
          }
          console.log(`${errors} \nRetrying..`);
          return timer(delayTime);
        })
      );
    };
  }

  private handleError(cause: number, errorMessage: string, timeDelayMs?: number): void {
    if (timeDelayMs) {
      const now = new Date();
      const time = (new Date(now.getTime() + timeDelayMs)).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' });
      this.errorSlObj.message = `Error occured with the ${this.application[cause]} api. The schedule is not up to date. Will retry again at ${time}.`;
      this.errorSlObj.color = "orange";
    } else {
      this.errorSlObj.message = `Error occured with the ${this.application[cause]} api. Please reload the page`;
      this.errorSlObj.color = "red";
      throw new Error(errorMessage);
    }
  }
}
