import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClockService } from 'src/app/shared/services/clock.service';
import { GeneralService } from 'src/app/shared/services/general.service';

@Component({
  selector: 'app-background-wallpaper',
  templateUrl: './background-wallpaper.component.html',
  styleUrls: ['./background-wallpaper.component.css']
})
export class BackgroundWallpaperComponent implements OnInit {
  public showFirst = true;

  public urlTop: string;

  public urlBottom: string;

  private readonly images: string[];

  private sub: Subscription;

  constructor(private generalService: GeneralService, private clockService: ClockService) {
    this.images = this.generalService.wallpaperImages;
  }

  ngOnInit(): void {
    this.sub = this.getBackgroundImageSub();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public getBackgroundTop(): string {
    const url = this.urlTop ?? '';
    return `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.6)), url("${url}")`;
  }

  public getBackgroundBottom(): string {
    const url = this.urlBottom ?? '';
    return `linear-gradient(rgba(77, 74, 76, 0.6), rgba(0, 0, 0, 0.6)), url("${url}")`;
  }

  private getBackgroundImageSub(): Subscription {
    return this.clockService.hourlyMark$
      .subscribe(() => {
        const url = this.images[Math.round(Math.random() * (this.images.length - 1))];

        // We do this in order to wait for the image to load before displaying it
        const image: HTMLImageElement = document.createElement('img');
        let self = this;
        image.addEventListener('load', function handleImageLoad() {
          if (self.showFirst) {
            self.urlTop = url;
          } else {
            self.urlBottom = url;
          }
          self.showFirst = !self.showFirst;
          image.removeEventListener('load', handleImageLoad);
        });
        setTimeout(() => {
          image.src = url; // begin loading image (to browser cache)
        });
      });
  }

}
