import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MessageResponse } from '../../../service/message-api.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  @Input() messages: MessageResponse[] = [];
  @Input() loading = false;
  @Input() canEdit = false;
  @Input() canDelete = false;

  @Output() updateMessage = new EventEmitter<{ id: number; content: string }>();
  @Output() deleteMessage = new EventEmitter<number>();

  editingMessageId: number | null = null;
  editingContent = '';

  getInitial(message: MessageResponse): string {
    const username = this.getUsername(message);

    if (!username || username === 'Unbekannt') {
      return '?';
    }

    return username.charAt(0).toUpperCase();
  }

  getUsername(message: MessageResponse): string {
    return message.sender?.username || message.username || 'Unbekannt';
  }

  getContent(message: MessageResponse): string {
    return message.content || message.message || '';
  }

  getSentAt(message: MessageResponse): string | undefined {
    return message.sentAt || message.createdAt || message.updatedAt;
  }

  startEdit(message: MessageResponse): void {
    if (!this.canEdit) {
      return;
    }

    this.editingMessageId = message.id;
    this.editingContent = this.getContent(message);
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editingContent = '';
  }

  saveEdit(message: MessageResponse): void {
    const content = this.editingContent.trim();

    if (!content) {
      return;
    }

    this.updateMessage.emit({
      id: message.id,
      content
    });

    this.cancelEdit();
  }

  confirmDelete(message: MessageResponse): void {
    if (!this.canDelete) {
      return;
    }

    const confirmed = confirm('Willst du diese Nachricht wirklich löschen?');

    if (!confirmed) {
      return;
    }

    this.deleteMessage.emit(message.id);
  }
}