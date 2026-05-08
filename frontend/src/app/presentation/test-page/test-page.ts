import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Imagelogo } from '../../assests/logo';
import { ListFormat } from 'typescript';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../test-page/test-service';
import { delay } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-page.html',
})
export class TestPage implements AfterViewChecked, OnInit {
  Math = Math;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  logo: string = Imagelogo;
  progress: number = 0;
  messagelist: { sender: string; text: string }[] = [];
  messages: string = '';
  questionCount: number = 0;
  async ngOnInit(): Promise<void> {
    const userIdStr = localStorage.getItem("id");
    if (!userIdStr || userIdStr === "undefined" || userIdStr === "null" || localStorage.getItem("loginStatus") !== "true") {
      this.router.navigate(['/signup']);
      return;
    }

    await this.delay(700);
    this.messagelist = [
      ...this.messagelist,
      { sender: 'ai', text: '👋 Welcome to the Personality Insights Test!' },
    ];
    await this.delay(1000);
    this.cdr.detectChanges();
    this.messagelist = [
      ...this.messagelist,
      {
        sender: 'ai',
        text: "I'm going to ask you a series of questions to understand your personality traits better.",
      },
    ];
    await this.delay(1000);
    this.cdr.detectChanges();

    this.messagelist = [
      ...this.messagelist,
      {
        sender: 'ai',
        text: 'This is not a clinical assessment, but a fun way to gain some self-awareness.',
      },
    ];
    await this.delay(1000);
    this.cdr.detectChanges();
    this.messagelist = [
      ...this.messagelist,
      { sender: 'ai', text: "Ready to begin? Just say 'yes' or 'ready' when you want to start." },
    ];
    this.cdr.detectChanges();
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onMessageSubmit(message: string) {
    if (this.messages.trim()) {
      // optional check
      this.messagelist = [...this.messagelist, { sender: 'user', text: this.messages }];
      this.messages = '';
    }
    this.scrollToBottom();

    if (message === '' || message === null || message === undefined) {
      console.warn('Message is empty. Not sending.');
      return;
    }

    this.questionCount++;
    let userIdStr = localStorage.getItem("id");
    
    // Safety check for broken storage values
    if (userIdStr === "undefined" || userIdStr === "null") {
      userIdStr = null;
      localStorage.removeItem("id");
    }

    const userId = (userIdStr && userIdStr !== "null") ? Number(userIdStr) : 0;
    console.log('Current logged-in User ID:', userId);
    
    if (isNaN(userId) || userId === 0) {
      console.warn('Warning: Invalid User ID detected. Report might not be associated correctly.');
    }

    this.send(message, userId, this.questionCount);
  }

  handleEnter(event: any) {
    if (!event.shiftKey) {
      // Enter → send
      event.preventDefault(); // stop new line
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const el = this.chatContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  send(message: string, userId: number, questionCount: number) {
    const body = {
      answer: message,
      questionCount: questionCount,
    };

    this.chatService.sendMessage(userId, body).subscribe({
      next: (res: any) => {
        console.log('Response:', res);

        this.messagelist = [...this.messagelist, { sender: 'ai', text: res.data }];
        if (res.questionNumber) {
          this.progress = (res.questionNumber / 15) * 100;
        } else {
          this.progress = 100;
        }
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.messagelist = [
          ...this.messagelist,
          { sender: 'ai', text: 'An error occurred while sending the message.' },
        ];
      },
    });
  }
}
