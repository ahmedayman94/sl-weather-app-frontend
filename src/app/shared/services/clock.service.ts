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

    public hourlyMark$ = this._hourlyMark$.asObservable();
    public minuteMark$ = this._minuteMark$.asObservable();
    public tenSecondMark$ = this._tenSecondMark$.asObservable();

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
                        time: nowDate.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })
                    }
                })
            )
            .subscribe(dateTime => this._dateTime$.next(dateTime));
    }

    public getDateAndTimeObs(): Observable<{ date: string, time: string }> {
        return this._dateTime$.asObservable().pipe(filter(x => !!x));
    }

    public getDayOfWeek(dayNumber: number): string {
        return this.dayOfWeek[dayNumber];
    }
}