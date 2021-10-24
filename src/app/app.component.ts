import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorModel } from './shared/models/error.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _errorSlSubject = new BehaviorSubject<ErrorModel>({ message: null, color: null });

  private _errorWeatherSubject = new BehaviorSubject<ErrorModel>(null);

  errorSl$ = this._errorSlSubject.asObservable();

  errorWeather$ = this._errorWeatherSubject.asObservable();

  constructor() { }

  onWeatherError(err: ErrorModel): void {
    this._errorWeatherSubject.next(err);
  }

  onSlError(err: ErrorModel): void {
    this._errorSlSubject.next(err);
  }
}
