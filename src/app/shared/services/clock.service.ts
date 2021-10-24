import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable, Subject, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ClockService {
    private readonly dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    private readonly monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    private readonly _dateTime$ = new ReplaySubject<{ date: string, time: string }>();

    private readonly _hourlyMark$ = new BehaviorSubject<void>(null);

    private readonly _minuteMark$ = new BehaviorSubject<number>(null);

    private readonly _tenSecondMark$ = new BehaviorSubject<void>(null);

    private readonly intervalOverMinuteMark = 30

    hourlyMark$ = this._hourlyMark$.asObservable();

    minuteMark$ = this._minuteMark$.asObservable();

    tenSecondMark$ = this._tenSecondMark$.asObservable();

    constructor() {
        timer(0, 10000)
            .pipe(
                map(() => {
                    // Used for rapid debugging
                    // this._tenSecondMark$.next();
                    const nowDate = new Date();
                    if (nowDate.getSeconds() < 10 + this.intervalOverMinuteMark
                        && nowDate.getSeconds() >= this.intervalOverMinuteMark) {
                        this._minuteMark$.next(nowDate.getMinutes());
                        if (nowDate.getMinutes() < 1) {
                            this._hourlyMark$.next();
                        }
                    }

                    return {
                        date: `${this.dayOfWeek[nowDate.getDay()]}, ${this.monthNames[nowDate.getMonth()]} ${nowDate.getDate()}`,
                        time: this.getTimeFormatFromDate(nowDate),
                    }
                })
            )
            .subscribe(dateTime => this._dateTime$.next(dateTime));
    }

    getDateAndTimeObs(): Observable<{ date: string, time: string }> {
        return this._dateTime$.asObservable().pipe(filter(x => !!x));
    }

    getDayOfWeek(dayNumber: number): string {
        return this.dayOfWeek[dayNumber];
    }

    getTimeFormatFromDate(date: Date): string {
        return date.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' });
    }
}