import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorModel } from './shared/models/error.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly _errorSlSubject$ = new BehaviorSubject<ErrorModel>({ message: null, color: null });
  public errorSl$ = this._errorSlSubject$.asObservable();

  public _errorWeatherSubject$ = new BehaviorSubject<ErrorModel>(null);
  public errorWeather$ = this._errorWeatherSubject$.asObservable();

  constructor() { }

  ngOnInit() {
  }

  public onWeatherError(err: any): void {
    this._errorWeatherSubject$.next({ message: err, color: "red" });
  }

  public onSlError(err: ErrorModel): void {
    this._errorSlSubject$.next(err);
  }
}
