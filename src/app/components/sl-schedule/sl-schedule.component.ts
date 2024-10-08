import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { forkJoin, Observable, timer } from 'rxjs';
import { map, mergeMap, retryWhen, share, switchMap, tap } from 'rxjs/operators';
import { ErrorModel } from 'src/app/shared/models/error.model';
import { Application } from 'src/app/shared/models/misc';
import { TransportationTimes } from 'src/app/shared/models/transportation-times.model';
import { ClockService } from 'src/app/shared/services/clock.service';
import { SLService } from 'src/app/shared/services/sl.service';

@Component({
  selector: 'app-sl-schedule',
  templateUrl: './sl-schedule.component.html',
  styleUrls: ['./sl-schedule.component.css']
})
export class SlScheduleComponent implements OnInit {
  @Output('onSlError') onError = new EventEmitter<ErrorModel>();

  transportationTimes$: Observable<TransportationTimes>;

  private application = ["SL", "Weatherbit", "Climacell"];

  private _errorSlObj: ErrorModel = { message: null, color: null, counter: 0 };

  constructor(private clockService: ClockService, private slService: SLService) { }

  ngOnInit(): void {
    // const minuteMark$ = this.clockService.minuteMark$.pipe(share());

    this.transportationTimes$ = timer(0, 2 * 60 * 1000).pipe(
      // filter(x => x == null || x % 2 === 0),
      switchMap(() => forkJoin([this.slService.fetchNextTransportationTime('bus'), this.slService.fetchNextTransportationTime('metro')])),
      tap(() => {
        // Reset error counter
        this._errorSlObj = { message: null, color: null, counter: 0 };
        this.onError.next(this._errorSlObj);
      }),
      map(([busRes, metroRes]) =>
      ({
        bus: {
          boardTime: this.slService.getStrListOfNextArrivals(busRes.departures),
          latestUpdate: this.clockService.getTimeFormatFromDate(new Date()),
        },
        metro: {
          boardTime: this.slService.getStrListOfNextArrivals(metroRes.departures),
          latestUpdate: this.clockService.getTimeFormatFromDate(new Date()),
        }
      }),
      ),
      retryWhen(this.retryStrategy()),
      share(),
    )
  }

  private retryStrategy(): (attempts: Observable<any>) => (Observable<any>) {
    const maxSlowerRetryTimes = 15, // Slower retry that runs every 10 minutes
      maxRetryTimes = 5,
      delayTime = 15000,
      slowerDelayTime = 60000 * 10; // Delay time of 10 minutes

    return (attempts: Observable<any>) => {
      return attempts.pipe(
        mergeMap((errors, _) => {
          this._errorSlObj.counter += 1;
          if (this._errorSlObj.counter > maxRetryTimes) {
            if (this._errorSlObj.counter > maxSlowerRetryTimes) {
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
      const time = this.clockService.getTimeFormatFromDate(new Date(now.getTime() + timeDelayMs));
      this._errorSlObj.message = `Error occured with the ${this.application[cause]} api. The schedule is not up to date. Will retry again at ${time}.`;
      this._errorSlObj.color = "orange";
      this.onError.next(this._errorSlObj);
    } else {
      this._errorSlObj.message = `Error occured with the ${this.application[cause]} api. Please reload the page`;
      this._errorSlObj.color = "red";
      this.onError.next(this._errorSlObj);

      throw new Error(errorMessage);
    }
  }

}
