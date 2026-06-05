import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageResponse } from '../../../service/chat-api.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  @Input() messages: MessageResponse[] = [];
  @Input() loading = false;

  getInitial(username?: string): string {
    if (!username) {
      return '?';
    }

    return username.charAt(0).toUpperCase();
  }
}