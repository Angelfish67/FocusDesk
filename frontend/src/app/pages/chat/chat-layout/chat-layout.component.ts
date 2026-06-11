import { Component } from '@angular/core';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';

 // komponente
@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    ChatSidebarComponent,
    ChatWindowComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.scss']
})
export class ChatLayoutComponent {

}