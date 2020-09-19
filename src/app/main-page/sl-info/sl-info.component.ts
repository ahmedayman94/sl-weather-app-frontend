import { Component, OnInit, OnDestroy } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { timer, merge, Observable, Subscription } from 'rxjs';
import { switchMap, retryWhen, tap, mergeMap, map, retry } from 'rxjs/operators';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { ClockService } from 'src/app/shared/services/clock.service';
import { QuoteService } from 'src/app/shared/services/quote.service';

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
  public transportationTimes = {
    bus: { boardTime: "", latestUpdate: "" },
    metro: { boardTime: "", latestUpdate: "" }
  };
  public dateTime: { time: string, date: string };
  public weatherInfo: { time: string; temperature: string, icon: string }[] = [];
  public errorSlObj = { message: "", color: "red", counter: 0 };
  public errorWeatherObj = { message: "", color: "red" };
  public quote = { quoteStr: null, author: null };

  private subscriptions: Subscription[] = [];
  private application = ["SL", "Weatherbit"];
  private url: string;
  private readonly images = [
    "https://vistapointe.net/images/stockholm-7.jpg",
    "https://cdn.pixabay.com/photo/2015/07/16/23/05/stockholm-848255_1280.jpg",
    "https://images.unsplash.com/photo-1542096275-2c33b1bdb375?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
    "https://images.unsplash.com/photo-1484037832928-afe345637f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80",
    "https://images.unsplash.com/photo-1508189860359-777d945909ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
    "https://images5.alphacoders.com/601/601884.jpg",
    "https://images2.alphacoders.com/734/734513.jpg",
    "https://wallpapercave.com/wp/wp2025113.jpg",
    "https://images.alphacoders.com/109/1094713.jpg",
    "https://images.alphacoders.com/485/485910.jpg",
    "/assets/img/bastien-herve--QBnKsP1P00-unsplash.jpg",
    "/assets/img/henrik_trygg-archipelago-4145.jpg",
    "/assets/img/wallpaperflare.com_wallpaper.jpg",
    "/assets/img/Stockholm Wallpaper Live Stockholm Wallpapers CAT98 Stockholm ....jpg"
  ];

  constructor(
    private slService: SLService,
    private weatherService: WeatherService,
    private clockService: ClockService,
    private quoteService: QuoteService
  ) { }

  ngOnInit() {
    this.subscriptions = [
      this.getClockSub(),
      this.getBackgroundImageSub(),
      this.getWeatherApiSub(),
      this.getSlApiSub(),
      this.getQuoteApiSub()
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getBackground(): string {
    return `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.6)), url("${this.url}")`;
  }

  public getImageByCode(code: string): string {
    const newImgMapped = this.weatherService.iconMapping[code],
      imgLink = newImgMapped ?
        `https://raw.githubusercontent.com/ClimaCell-API/weather-code-icons/79fe6484cd5f9f7a482d7391c12712a1ac1b2602/color/${newImgMapped}` :
        `https://www.weatherbit.io/static/img/icons/${code}.png`;

    return imgLink;
  }

  private getClockSub(): Subscription {
    return this.clockService.getDateAndTimeObs()
      .subscribe(dateAndTime => {
        this.dateTime = { date: dateAndTime.date, time: dateAndTime.time };
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
          this.errorSlObj.counter = 0; // Reset error counter
          this.errorSlObj.message = "";
          if (res.ResponseData.Metros.length > 0) {
            this.transportationTimes.metro = {
              boardTime: this.slService.getStrListOfNextArrivals(res.ResponseData.Metros),
              latestUpdate: (new Date(res.ResponseData.LatestUpdate)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            };
          } else {
            this.transportationTimes.bus = {
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

  private getQuoteApiSub(): Subscription {
    return this.quoteService.fetchQuote()
      .subscribe(res => {
        this.quote.quoteStr = res.content;
        this.quote.author = res.author;
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
      const time = (new Date(now.getTime() + timeDelayMs)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
      this.errorSlObj.message = `Error occured with the ${this.application[cause]} api. The schedule is not up to date. Will retry again at ${time}.`;
      this.errorSlObj.color = "orange";
    } else {
      this.errorSlObj.message = `Error occured with the ${this.application[cause]} api. Please reload the page`;
      this.errorSlObj.color = "red";
      throw new Error(errorMessage);
    }
  }
}
