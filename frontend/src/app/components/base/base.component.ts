import { Component, inject } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-base',
    template: ''
})
export class BaseComponent {
  protected translate = inject(TranslateService);


  protected messageSaved = '';
  protected messageError = '';
  protected messageNewSaved = '';
  protected messageNewError = '';
  protected messageClose = '';
  protected deletedMessage = '';
  protected deleteErrorMessage = '';
  protected closeMessage = '';

  constructor() {
    this.translate.get(['messages.save_ok', 'messages.close', 'messages.save_error',
      'messages.save_new_ok', 'messages.save_new_error',
      'messages.deleted_ok', 'messages.delete_error', 'messages.close']).subscribe(text => {
      this.messageSaved = text['messages.save_ok'];
      this.messageClose = text['messages.close'];
      this.messageError = text['messages.save_error'];
      this.messageNewSaved = text['messages.save_new_ok'];
      this.messageNewError = text['messages.save_new_error'];
      this.deletedMessage = text['messages.deleted_ok'];
      this.deleteErrorMessage = text['messages.delete_error'];
      this.closeMessage = text['messages.close'];
    });
  }

}
