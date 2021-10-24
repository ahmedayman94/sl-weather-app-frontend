import { Component, Input, OnInit } from '@angular/core';
import { ErrorModel } from 'src/app/shared/models/error.model';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent implements OnInit {
  @Input() errorWeather: ErrorModel;

  @Input() errorSl: ErrorModel;

  constructor() { }

  ngOnInit(): void { }
}
