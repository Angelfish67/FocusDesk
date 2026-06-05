import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    UserProfileComponent
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent {

}