import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LanguageService {
  private languageChangeSubject = new Subject<string>();
  languageChange$ = this.languageChangeSubject.asObservable();

  emitLanguageChange(language: string) {
    this.languageChangeSubject.next(language);
  }
}