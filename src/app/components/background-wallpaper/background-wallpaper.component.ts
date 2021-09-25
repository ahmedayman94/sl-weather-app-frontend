import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClockService } from 'src/app/shared/services/clock.service';
import { GeneralService } from 'src/app/shared/services/general.service';

@Component({
  selector: 'app-background-wallpaper',
  templateUrl: './background-wallpaper.component.html',
  styleUrls: ['./background-wallpaper.component.css']
})
export class BackgroundWallpaperComponent implements OnInit {
  showFirst = true;

  urlTop$: Observable<string>;

  urlBottom$: Observable<string>;

  private images: string[];

  private _urlTopSubject = new BehaviorSubject<string>('');

  private _urlBottomSubject = new BehaviorSubject<string>('');

  private sub: Subscription;

  private _initialized = false;

  constructor(private generalService: GeneralService, private clockService: ClockService) {
    this.urlBottom$ = this._urlBottomSubject.asObservable()
      .pipe(map(url => `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.6)), url("${url}")`));

    this.urlTop$ = this._urlTopSubject.asObservable()
      .pipe(map(url => `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.6)), url("${url}")`));
  }

  ngOnInit(): void {
    this.images = this.generalService.wallpaperImages;
    this.sub = this.getBackgroundImageSub();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private getBackgroundImageSub(): Subscription {
    return this.clockService.hourlyMark$
      .subscribe(() => {
        // Get a random image from without assets the first time
        // This is due to a problem loading it first for some reason..
        // const url = !this._initialized ? this.getRandomImageFromList(4) : this.getRandomImageFromList();
        // this._initialized = true;
        const url = this.getRandomImageFromList();

        // We do this in order to wait for the image to load before displaying it
        const image: HTMLImageElement = document.createElement('img');
        let self = this;
        image.addEventListener('load', function handleImageLoad() {
          if (self.showFirst) {
            self._urlTopSubject.next(url);
          } else {
            self._urlBottomSubject.next(url);
          }
          self.showFirst = !self.showFirst;
          image.removeEventListener('load', handleImageLoad);
        });
        setTimeout(() => {
          image.src = url; // begin loading image (to browser cache)
        });
      });
  }

  private getRandomImageFromList(len?: number): string {
    return this.images[Math.round(Math.random() * ((len ?? this.images.length) - 1))];
  }
}
