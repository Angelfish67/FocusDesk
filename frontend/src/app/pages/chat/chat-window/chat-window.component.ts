import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MessageListComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {

}