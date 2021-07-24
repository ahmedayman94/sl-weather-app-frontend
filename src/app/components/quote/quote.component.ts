import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share, shareReplay } from 'rxjs/operators';
import { QuoteService } from 'src/app/shared/services/quote.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css']
})
export class QuoteComponent implements OnInit {

  public quoteContent$: Observable<string>;

  public quoteAuthor$: Observable<string>;

  constructor(private quoteService: QuoteService) { }

  ngOnInit(): void {
    const quote$ = this.quoteService.fetchQuote().pipe(share());

    this.quoteAuthor$ = quote$.pipe(map(quote => quote.author));
    this.quoteContent$ = quote$.pipe(map(quote => quote.content));
  }
}
