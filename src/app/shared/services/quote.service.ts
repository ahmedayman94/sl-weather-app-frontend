import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Quote } from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class QuoteService {
    constructor(private httpClient: HttpClient) { }

    public fetchQuote(): Observable<Quote> {
        return this.httpClient.get<Quote>('https://api.quotable.io/random')
    }
}