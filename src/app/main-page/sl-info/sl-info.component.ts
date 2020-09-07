import { Component, OnInit, OnDestroy } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { timer, merge, Observable, Subscription } from 'rxjs';
import { switchMap, retryWhen, tap, mergeMap, map, retry } from 'rxjs/operators';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { ClockService } from 'src/app/shared/services/clock.service';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

enum Application {
  SL,
  WEATHERBIT
}

@Component({
  selector: 'app-sl-info',
  templateUrl: './sl-info.component.html',
  styleUrls: ['./sl-info.component.css']
})
export class SlInfoComponent implements OnInit, OnDestroy {
  public busTimes: { boardTime: string, latestUpdate: string };
  public metroTimes: { boardTime: string, latestUpdate: string };
  public now: string;
  public date: string;
  public weatherInfo: { time: string; temperature: string, icon: string }[] = [];
  public errorMessage: string;

  private subscriptions: Subscription[] = [];
  private errorCounter = 0;

  private application = ["SL", "Weatherbit"];
  private url: string;
  private readonly images = [
    "https://images5.alphacoders.com/601/601884.jpg",
    "https://images2.alphacoders.com/734/734513.jpg",
    "https://wallpapercave.com/wp/wp2025113.jpg",
    "https://images.alphacoders.com/109/1094713.jpg",
    "https://images.alphacoders.com/485/485910.jpg",
  ];

  constructor(
    private slService: SLService,
    private weatherService: WeatherService,
    private clockService: ClockService
  ) { }

  ngOnInit() {
    this.subscriptions = [
      this.getClockSub(),
      this.getBackgroundImageSub(),
      this.getWeatherApiSub(),
      this.getSlApiSub()
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getBackground(): string {
    return `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.3)), url("${this.url}")`;
  }

  public getImageByCode(code: string): string {
    const newImgMapped = this.weatherService.iconMapping[code];
    const imgLink: string = newImgMapped ?
      `https://raw.githubusercontent.com/ClimaCell-API/weather-code-icons/79fe6484cd5f9f7a482d7391c12712a1ac1b2602/color/${newImgMapped}` :
      `https://www.weatherbit.io/static/img/icons/${code}.png`;
    return imgLink;
  }

  private getClockSub(): Subscription {
    return this.clockService.getDateAndTimeObs()
      .subscribe(dateAndTime => {
        this.date = dateAndTime.date;
        this.now = dateAndTime.time;
      });
  }

  private getBackgroundImageSub(): Subscription {
    return this.clockService.hourlyMark$
      .subscribe(() => this.url = this.images[Math.round(Math.random() * (this.images.length - 1))])
  }

  private getSlApiSub(): Subscription {
    return this.clockService.minuteMark$.pipe(
      switchMap(() => merge(this.slService.fetchNextTransportationTime(Stations.TESSIN_PARKEN), this.slService.fetchNextTransportationTime(Stations.GARDET_TUNNEL_BANA))),
      retryWhen(this.retryStrategy())
    )
      .subscribe(
        res => {
          this.errorCounter = 0; // Reset error counter
          if (res.ResponseData.Metros.length > 0) {
            this.metroTimes = {
              boardTime: this.slService.getStrListOfNextArrivals(res.ResponseData.Metros),
              latestUpdate: (new Date(res.ResponseData.LatestUpdate)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            };
          } else {
            this.busTimes = {
              boardTime: this.slService.getStrListOfNextArrivals(res.ResponseData.Buses),
              latestUpdate: (new Date(res.ResponseData.LatestUpdate)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            };
          }
        },
        err => console.error(err)
      );
  }

  private getWeatherApiSub(): Subscription {
    return this.clockService.hourlyMark$.pipe(
      switchMap(() => this.weatherService.fetchWeather(8)),
      retry(3),
      map(res => res.data)
    ).subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        const data = res[i];

        this.weatherInfo[i] = {
          time: new Date(data.timestamp_local).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }),
          temperature: `${Math.round(data.temp)} °C`,
          icon: data.weather.icon
        };
      }
    },
      err => this.handleError(Application.WEATHERBIT, err));
  }

  private retryStrategy(): (attempts: Observable<any>) => (Observable<any>) {
    const maxRetryTimes = 5;
    const delayTime = 15000;

    return (attempts: Observable<any>) => {
      return attempts.pipe(
        mergeMap((errors, _) => {
          this.errorCounter += 1;
          if (this.errorCounter > maxRetryTimes) {
            this.handleError(Application.SL, errors);
          }
          console.log(`${errors} \n Retrying..`);
          return timer(delayTime);
        })
      );
    };
  }

  private handleError(cause: number, errorMessage: string): void {
    this.errorMessage = `Error occured with the ${this.application[cause]} api. Please reload the page`;
    throw new Error(errorMessage);
  }
}
