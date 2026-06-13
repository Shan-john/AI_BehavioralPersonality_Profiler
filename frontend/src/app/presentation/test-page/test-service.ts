import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = `${environment.apiUrl}/ai/chat`;

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