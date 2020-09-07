import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ClockService {
    private readonly dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    private readonly monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    private readonly _hourlyMark$ = new BehaviorSubject<any>(null);
    private readonly _minuteMark$ = new BehaviorSubject<any>(null);
    private readonly intervalOverMinuteMark = 30

    public hourlyMark$ = this._hourlyMark$.asObservable();
    public minuteMark$ = this._minuteMark$.asObservable();

    constructor() {

    }

    public getDateAndTimeObs(): Observable<{ date: string, time: string }> {
        return timer(0, 10000)
            .pipe(
                map(() => {
                    const nowDate = new Date();
                    if (nowDate.getSeconds() < 10 + this.intervalOverMinuteMark
                        && nowDate.getSeconds() >= this.intervalOverMinuteMark) {
                        this._minuteMark$.next(null);
                        if (nowDate.getMinutes() < 1) {
                            this._hourlyMark$.next(null);
                        }
                    }

                    return {
                        date: `${this.dayOfWeek[nowDate.getDay()]}, ${this.monthNames[nowDate.getMonth()]} ${nowDate.getDate()}`,
                        time: nowDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
                    }
                })
            );
    }


}