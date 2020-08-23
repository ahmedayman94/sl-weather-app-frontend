import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SLService } from 'src/app/shared/services/sl.service';
import { SLApiResponse } from 'src/app/shared/models/sl-api-response.model';
import { SLTransportationMethod } from 'src/app/shared/models/sl-transportation-method.model';
import { interval, timer, merge } from 'rxjs';
import { switchMap, retry } from 'rxjs/operators';
import { WeatherService } from 'src/app/shared/services/weather.service';

enum Stations {
  TESSIN_PARKEN = 1131,
  GARDET_TUNNEL_BANA = 9221
};

@Component({
  selector: 'app-sl-info',
  templateUrl: './sl-info.component.html',
  styleUrls: ['./sl-info.component.css']
})
export class SlInfoComponent implements OnInit {
  public busTimes: { boardTime: string };
  public metroTimes: { boardTime: string };
  public now: string;

  constructor(
    private slService: SLService,
    private weatherService: WeatherService
  ) {
    this.busTimes = { boardTime: null };
  }

  ngOnInit() {
    timer(0, 30000).pipe(
      switchMap(() => merge(this.slService.fetchNextTransportationTime(Stations.TESSIN_PARKEN), this.slService.fetchNextTransportationTime(Stations.GARDET_TUNNEL_BANA))),
      retry(2)
    )
      .subscribe(res => {
        if (res.StatusCode !== 0) {
          throw new Error("Error has occured. The api has sent the following: " + res.Message);
        }

        if (res.ResponseData.Metros.length > 0) {
          this.metroTimes = { boardTime: this.loopThroughNextArrivals(res.ResponseData.Metros) };
        } else {
          this.busTimes = { boardTime: this.loopThroughNextArrivals(res.ResponseData.Buses) };
        }
      });

    timer(0, 60000).pipe(
      switchMap(() => this.weatherService.fetchWeather(8))
    )

    timer(0, 10000)
      .subscribe(() => this.now = (new Date()).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }));
  }

  private loopThroughNextArrivals(transportationMethod: SLTransportationMethod[]): string {
    let returnStr = "<ul>";
    transportationMethod
      .filter(tm => tm.JourneyDirection === 2)
      .forEach(tm => {
        const now = new Date();
        const originalTableTime = Date.parse(tm.ExpectedDateTime) - now.getTime();
        returnStr += `<li>${tm.DisplayTime} (Original Table Time: ${new Date(originalTableTime).getMinutes()} min) </li>`;
      });
    returnStr += "</ul>";

    return returnStr;
  }

  // This does not update the html page for some reason..
  private responseProcessor(res: SLApiResponse): void {
    if (res.StatusCode !== 0) {
      throw new Error("Error has occured. The api has sent the following: " + res.Message);
    }
    let transportationMethod: SLTransportationMethod[];
    let lineName: string;

    if (res.ResponseData.Buses.length > 0) {
      transportationMethod = res.ResponseData.Buses;
    } else {
      transportationMethod = res.ResponseData.Metros;
    }
  }
}
