import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {HeaderService} from '../../service/header.service';
import {Subscription} from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html',
    styleUrls: ['./app-header.component.scss'],
    imports: [TranslateModule]
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private headerService = inject(HeaderService);


  currentPage = '';
  private subPage?: Subscription;

  async ngOnInit() {
    this.subPage = this.headerService.pageObservable.subscribe(page => {
      this.currentPage = page;
    });
  }

  ngOnDestroy(): void {
    this.subPage?.unsubscribe();
  }

}
