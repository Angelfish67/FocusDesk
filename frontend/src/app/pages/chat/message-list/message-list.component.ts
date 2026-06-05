import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Message {
  username: string;
  avatar: string;
  time: string;
  content: string;
}

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {

  messages: Message[] = [
    {
      username: 'Samira',
      avatar: 'S',
      time: '09:21',
      content: 'kitcord'
    },
  ];

}