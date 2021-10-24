import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { ClockService } from 'src/app/shared/services/clock.service';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.css']
})
export class DateTimeComponent implements OnInit {

  date$: Observable<string>;

  time$: Observable<string>;

  constructor(private clockService: ClockService) { }

  ngOnInit(): void {
    const dateTime$ = this.clockService.getDateAndTimeObs().pipe(share());

    this.date$ = dateTime$.pipe(map(dateTime => dateTime.date));
    this.time$ = dateTime$.pipe(map(dateTime => dateTime.time));
  }
}
