import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Departure, SLApiResponse } from '../models/api-response/sl-api-response.model';
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

    fetchNextTransportationTime(modeOfTransport: 'bus' | 'metro'): Observable<SLApiResponse> {
        const url = environment.production ?
            `${environment.localSLApiUrl}/${modeOfTransport}` :
            `${environment.localSLApiUrl}/${modeOfTransport}`
        // `./assets/sl-${modeOfTransport}-mockdata.json`;
        return this.httpClient.get<SLApiResponse>(url);
    }

    getStrListOfNextArrivals(transportationMethod: Departure[]): string {
        const calculateOriginalTableTime = (tm: Departure, expectedTime: string): string => {
            if (tm.display.toLowerCase() === "now") {
                return '';
            }

            const tableTime = this.clockService.getTimeFormatFromDate(new Date(tm.scheduled));

            return tableTime === expectedTime ? '' : `(Original table time: ${tableTime})`;
        };

        let returnStr = "<ul>";
        transportationMethod
            .slice(0, 3) // Only return a maximum of 3 values
            .forEach(tm => {
                const expectedTime = this.clockService.getTimeFormatFromDate(new Date(tm.expected));
                const originalTableTime = calculateOriginalTableTime(tm, expectedTime);
                returnStr += `<li>${expectedTime}  <span>${originalTableTime}</span> </li>`;
            });
        returnStr += "</ul>";

        return returnStr;
    }
}