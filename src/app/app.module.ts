import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './mat.module';
import { QuoteComponent } from './components/quote/quote.component';
import { DateTimeComponent } from './components/date-time/date-time.component';
import { BackgroundWallpaperComponent } from './components/background-wallpaper/background-wallpaper.component';
import { WeatherComponent } from './components/weather/weather.component';
import { SlScheduleComponent } from './components/sl-schedule/sl-schedule.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';

@NgModule({
  declarations: [
    AppComponent,
    QuoteComponent,
    DateTimeComponent,
    BackgroundWallpaperComponent,
    WeatherComponent,
    SlScheduleComponent,
    ErrorMessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
