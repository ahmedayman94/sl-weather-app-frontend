import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SLApiResponse } from '../models/api-response/sl-api-response.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SLTransportationMethod } from '../models/sl-transportation-method.model';
import { ClockService } from './clock.service';

@Injectable({ providedIn: 'root' })
export class SLService {
    constructor(
        private httpClient: HttpClient,
        private clockService: ClockService,
    ) {
    }

    public fetchNextTransportationTime(siteId: number): Observable<SLApiResponse> {
        const url = environment.production ?
            `${environment.localSLApiUrl}?siteid=${siteId}` :
            `./assets/sl-${siteId}-mockdata.json`;
        return this.httpClient.get<SLApiResponse>(url)
            .pipe(
                tap(res => {
                    if (res.StatusCode !== 0) throw new Error("Error has occured. The api has sent the following: " + res.Message);
                })
            );
    }

    public getStrListOfNextArrivals(transportationMethod: SLTransportationMethod[], journeyDirection: number): string {
        const calculateOriginalTableTime = (tm: SLTransportationMethod, expectedTime: string): string => {
            if (tm.DisplayTime === "Nu" || tm.DisplayTime.indexOf(':') !== -1) {
                return '';
            }

            const tableTime = this.clockService.getTimeFormatFromDate(new Date(tm.TimeTabledDateTime));

            return tableTime === expectedTime ? '' : `(Original table time: ${tableTime})`;
        };

        let returnStr = "<ul>";
        transportationMethod
            .filter(tm => tm.JourneyDirection === journeyDirection)
            .slice(0, 3) // Only return a maximum of 3 values
            .forEach(tm => {
                const expectedTime = this.clockService.getTimeFormatFromDate(new Date(tm.ExpectedDateTime));
                const originalTableTime = calculateOriginalTableTime(tm, expectedTime);
                returnStr += `<li>${expectedTime}  <span>${originalTableTime}</span> </li>`;
            });
        returnStr += "</ul>";

        return returnStr;
    }

}