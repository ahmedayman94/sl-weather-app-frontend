import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlScheduleComponent } from './sl-schedule.component';

describe('SlScheduleComponent', () => {
  let component: SlScheduleComponent;
  let fixture: ComponentFixture<SlScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
