import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlInfoComponent } from './main-page/sl-info/sl-info.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './mat.module';

@NgModule({
  declarations: [
    AppComponent,
    SlInfoComponent
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
