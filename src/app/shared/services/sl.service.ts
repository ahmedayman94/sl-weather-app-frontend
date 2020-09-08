import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SLApiResponse } from '../models/sl-api-response.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SLTransportationMethod } from '../models/sl-transportation-method.model';

@Injectable({ providedIn: 'root' })
export class SLService {
    constructor(
        private httpClient: HttpClient
    ) {
    }

    public fetchSomething() {
        return this.httpClient.get('')
    }

    public fetchNextTransportationTime(siteId: number): Observable<SLApiResponse> {
        const url = environment.production ?
            `${environment.localSlApiUrl}?key=${environment.slApiKey}&siteid=${siteId}` :
            `./assets/sl-${siteId}-mockdata.json`;

        return this.httpClient.get<SLApiResponse>(url)
            .pipe(
                tap(res => {
                    if (res.StatusCode !== 0) throw new Error("Error has occured. The api has sent the following: " + res.Message);
                })
            );
    }

    public getStrListOfNextArrivals(transportationMethod: SLTransportationMethod[]): string {
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
                returnStr += `<li>${tm.DisplayTime}  <span>${originalTableTime}</span> </li>`;
            });
        returnStr += "</ul>";

        return returnStr;
    }

}