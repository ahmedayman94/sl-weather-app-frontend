import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorModel } from './shared/models/error.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public errorSlObj$: Observable<ErrorModel>;// = { message: "", color: "red", counter: 0 };
  public errorSlObj = { message: "", color: "red", counter: 0 };

  public _errorWeatherSubject$ = new BehaviorSubject<ErrorModel>(null);
  public errorWeather$ = this._errorWeatherSubject$.asObservable();

  constructor() { }

  ngOnInit() {
  }

  public onWeatherError(err: any): void {
    this._errorWeatherSubject$.next({ message: err, color: "red" });
  }
}
