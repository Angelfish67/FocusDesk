import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private pageSubject = new BehaviorSubject<string>('');

  public readonly pageObservable: Observable<string> = this.pageSubject.asObservable();

  setPage(page: string): void {
    this.pageSubject.next(page);
  }

  getCurrentPage(): string {
    return this.pageSubject.value;
  }
}