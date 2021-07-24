import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundWallpaperComponent } from './background-wallpaper.component';

describe('BackgroundWallpaperComponent', () => {
  let component: BackgroundWallpaperComponent;
  let fixture: ComponentFixture<BackgroundWallpaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundWallpaperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundWallpaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
