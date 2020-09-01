import { Component, OnInit, OnDestroy } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { SLApiResponse } from 'src/app/shared/models/sl-api-response.model';
import { SLTransportationMethod } from 'src/app/shared/models/sl-transportation-method.model';
import { timer, merge, Observable, Subscription } from 'rxjs';
import { switchMap, retryWhen, tap, mergeMap, map, retry } from 'rxjs/operators';
import { WeatherService } from 'src/app/shared/services/weather.service';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

enum Application {
  SL,
  WEATHERBIT
}

const timeOfDayImage = {
  "day": "https://images5.alphacoders.com/601/601884.jpg",
  "evening": "https://images2.alphacoders.com/734/734513.jpg",
  "night": "https://images.alphacoders.com/485/485910.jpg"
};

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

  // private latestUpdateTime: Date;
  private subscriptions: Subscription[] = [];
  private dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  private monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  private application = ["SL", "Weatherbit"];
  private count = 0;
  private timeOfDay: string = "day";

  constructor(
    private slService: SLService,
    private weatherService: WeatherService
  ) { }

  ngOnInit() {
    this.subscriptions = [
      this.getClockSub(),
      // this.getWeatherApiSub(),
      // this.getSlApiSub()];
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getImageByCode(code: string): string {
    return `https://www.weatherbit.io/static/img/icons/${code}.png`;
  }

  public getBackground(): string {
    const url = timeOfDayImage[this.timeOfDay];
    return `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.3)), url("${url}")`;
  }

  private getClockSub(): Subscription {
    return timer(0, 10000)
      .subscribe(() => {
        const nowDate = new Date();
        this.date = `${this.dayOfWeek[nowDate.getDay()]}, ${this.monthNames[nowDate.getMonth()]} ${nowDate.getDate()}`;
        this.now = nowDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
        this.timeOfDay = this.getTimeOfDay(nowDate);
      });
  }

  private getSlApiSub(): Subscription {
    return timer(0, 30000).pipe(
      switchMap(() => merge(this.fetchNextTableTimes(Stations.TESSIN_PARKEN), this.fetchNextTableTimes(Stations.GARDET_TUNNEL_BANA))),
      retryWhen(this.retryStrategy())
    )
      .subscribe(
        res => {
          // this.latestUpdateTime = new Date(res.ResponseData.LatestUpdate);
          if (res.ResponseData.Metros.length > 0) {
            this.metroTimes = {
              boardTime: this.getStrListOfNextArrivals(res.ResponseData.Metros),
              latestUpdate: (new Date(res.ResponseData.LatestUpdate)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            };
          } else {
            this.busTimes = {
              boardTime: this.getStrListOfNextArrivals(res.ResponseData.Buses),
              latestUpdate: (new Date(res.ResponseData.LatestUpdate)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            };
          }
        },
        err => console.error(err)
      );
  }

  private getWeatherApiSub(): Subscription {
    return timer(0, 3600000).pipe(
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

  private fetchNextTableTimes(stationNumber: number): Observable<SLApiResponse> {
    return this.slService.fetchNextTransportationTime(stationNumber)
      .pipe(
        tap(res => {
          if (res.StatusCode !== 0) throw new Error("Error has occured. The api has sent the following: " + res.Message);
        })
      );
  }

  private getStrListOfNextArrivals(transportationMethod: SLTransportationMethod[]): string {
    function calculateOriginalTableTime(tm: SLTransportationMethod, now: Date): string {
      if (tm.DisplayTime === "Nu" || tm.DisplayTime.indexOf(':') !== -1) {
        return '';
      }
      const timeDifference = new Date(Date.parse(tm.ExpectedDateTime) - now.getTime()).getMinutes();
      const regex = new RegExp(/\d+/);
      const regexResult = regex.exec(tm.DisplayTime);
      if (regexResult.length > 0 && timeDifference.toString() === regexResult[0]) {
        return '';
      }

      return `(Original Table Time: ${timeDifference} min)`;
    }

    let returnStr = "<ul>";
    transportationMethod
      .filter(tm => tm.JourneyDirection === 2)
      .slice(0, 3) // Only return a maximum of 3 values
      .forEach(tm => {
        const now = new Date();
        const originalTableTime = calculateOriginalTableTime(tm, now);
        returnStr += `<li>${tm.DisplayTime}  <span style="font-size: 25%">${originalTableTime}</span> </li>`;
      });
    returnStr += "</ul>";

    return returnStr;
  }

  private retryStrategy(): (attempts: Observable<any>) => (Observable<any>) {
    const maxRetryTimes = 5;
    const delayTime = 15000;

    return (attempts: Observable<any>) => {
      return attempts.pipe(
        mergeMap((errors, i) => {
          const retryAttempt = i + 1;
          if (retryAttempt > maxRetryTimes) {
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

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours()
    if (hour < 5 || hour > 19) {
      return "night";
    } else if (hour < 16) {
      return "day";
    } else {
      return "evening";
    }
  }


  // // This does not update the html page for some reason..
  // private responseProcessor(res: SLApiResponse): void {
  //   if (res.StatusCode !== 0) {
  //     throw new Error("Error has occured. The api has sent the following: " + res.Message);
  //   }
  //   let transportationMethod: SLTransportationMethod[];

  //   if (res.ResponseData.Buses.length > 0) {
  //     transportationMethod = res.ResponseData.Buses;
  //   } else {
  //     transportationMethod = res.ResponseData.Metros;
  //   }
  // }
}
