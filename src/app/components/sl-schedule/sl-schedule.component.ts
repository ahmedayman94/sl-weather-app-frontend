import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, timer } from 'rxjs';
import { map, mergeMap, retryWhen, share, switchMap } from 'rxjs/operators';
import { Application } from 'src/app/shared/models/misc';
import { TransportationTimes } from 'src/app/shared/models/transportation-times.model';
import { ClockService } from 'src/app/shared/services/clock.service';
import { SLService } from 'src/app/shared/services/sl.service';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

@Component({
  selector: 'app-sl-schedule',
  templateUrl: './sl-schedule.component.html',
  styleUrls: ['./sl-schedule.component.css']
})
export class SlScheduleComponent implements OnInit {
  errorSlObj: any;

  public transportationTimes$: Observable<TransportationTimes>;

  private application = ["SL", "Weatherbit", "Climacell"];


  constructor(private clockService: ClockService, private slService: SLService) { }

  ngOnInit(): void {
    const minuteMark$ = this.clockService.minuteMark$.pipe(share());

    this.transportationTimes$ = minuteMark$.pipe(
      switchMap(() => forkJoin([this.slService.fetchNextTransportationTime(Stations.TESSIN_PARKEN), this.slService.fetchNextTransportationTime(Stations.GARDET_TUNNEL_BANA)])),
      map(([busRes, metroRes]) =>
      ({
        bus: {
          boardTime: this.slService.getStrListOfNextArrivals(busRes.ResponseData.Buses),
          latestUpdate: (new Date(busRes.ResponseData.LatestUpdate)).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
        },
        metro: {
          boardTime: this.slService.getStrListOfNextArrivals(metroRes.ResponseData.Metros),
          latestUpdate: (new Date(metroRes.ResponseData.LatestUpdate)).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
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
