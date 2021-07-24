import { Component, OnInit, OnDestroy } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { switchMap, retryWhen, mergeMap, map, retry, skip } from 'rxjs/operators';
import { timer, Observable, Subscription, forkJoin, BehaviorSubject } from 'rxjs';
import { WeatherService } from 'src/app/shared/services/weather.service';
import { ClockService } from 'src/app/shared/services/clock.service';
import { SunTimes } from 'src/app/shared/models/sun-time.model';
import { Application, WeatherApp } from 'src/app/shared/models/misc';
import { ErrorModel } from 'src/app/shared/models/error.model';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

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
  public errorSlObj$: Observable<ErrorModel>;// = { message: "", color: "red", counter: 0 };
  public errorSlObj = { message: "", color: "red", counter: 0 };

  public _errorWeatherSubject$ = new BehaviorSubject<ErrorModel>(null);
  public errorWeather$ = this._errorWeatherSubject$.asObservable();

  private subscriptions: Subscription[] = [];
  private application = ["SL", "Weatherbit", "Climacell"];


  constructor(
    private slService: SLService,
    private clockService: ClockService,
  ) { }

  ngOnInit() {
    this.subscriptions = [
      this.getSlApiSub(),
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public onWeatherError(err: any): void {
    this._errorWeatherSubject$.next({ message: err, color: "red" });
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
