 import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:5233/api/ai/chat'; // adjust if needed

  constructor(private http: HttpClient) {}

  sendMessage(userId: number, messageData: any) {

    const params = new HttpParams().set('userId', userId);

    return this.http.post(
      this.apiUrl,
      messageData,
      { params }
    );
  }
}