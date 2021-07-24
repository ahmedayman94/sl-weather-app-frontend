import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlInfoComponent } from './main-page/sl-info/sl-info.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './mat.module';
import { QuoteComponent } from './components/quote/quote.component';
import { DateTimeComponent } from './components/date-time/date-time.component';
import { BackgroundWallpaperComponent } from './components/background-wallpaper/background-wallpaper.component';

@NgModule({
  declarations: [
    AppComponent,
    SlInfoComponent,
    QuoteComponent,
    DateTimeComponent,
    BackgroundWallpaperComponent
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
