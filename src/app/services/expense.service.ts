import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebhookPayload, N8nResponse } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly webhookUrl = environment.n8nWebhookUrl;

  constructor(private readonly http: HttpClient) { }

  /**
   * Envía un mensaje de texto al webhook de n8n
   * @param payload - Datos del mensaje a enviar
   * @returns Observable con la respuesta del webhook
   */
  sendExpenseMessage(payload: WebhookPayload): Observable<N8nResponse> {
    return this.http.post<N8nResponse>(this.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
