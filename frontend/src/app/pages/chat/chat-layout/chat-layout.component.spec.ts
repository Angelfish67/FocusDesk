import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLayoutComponent } from './chat-layout.component';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  template: ''
})
class MockChatSidebarComponent {}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  template: ''
})
class MockChatWindowComponent {}

describe('ChatLayoutComponent', () => {
  let component: ChatLayoutComponent;
  let fixture: ComponentFixture<ChatLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatLayoutComponent
      ]
    })
      .overrideComponent(ChatLayoutComponent, {
        remove: {
          imports: [
            ChatSidebarComponent,
            ChatWindowComponent
          ]
        },
        add: {
          imports: [
            MockChatSidebarComponent,
            MockChatWindowComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChatLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});