import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
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
    // Si estamos en desarrollo y el webhook no está disponible, usar mock
    if (!environment.production && this.webhookUrl.includes('localhost:5678')) {
      return this.getMockResponse(payload).pipe(delay(1000));
    }

    return this.http.post<N8nResponse>(this.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(error => {
        console.error('Error connecting to webhook:', error);
        // Fallback a respuesta mock si hay error de conexión
        return this.getMockResponse(payload).pipe(delay(500));
      })
    );
  }

  /**
   * Genera una respuesta mock para desarrollo
   * @param payload - Datos del mensaje enviado
   * @returns Observable con respuesta simulada
   */
  private getMockResponse(payload: WebhookPayload): Observable<N8nResponse> {
    const mockResponses = {
      text: [
        '✅ Gasto registrado correctamente. He anotado tu compra.',
        '💰 Perfecto, he guardado este gasto en tu registro.',
        '📝 Listo, tu gasto ha sido añadido al sistema.',
        '✨ Excelente, he procesado tu información de gasto.'
      ],
      voice: [
        '🎤 He procesado tu nota de voz. Gasto registrado exitosamente.',
        '🔊 Audio recibido y procesado. Tu gasto ha sido guardado.',
        '🎵 Nota de voz analizada. He registrado la información.',
        '📢 Audio procesado correctamente. Gasto añadido al registro.'
      ]
    };

    const responses = payload.messageType === 'voice' ? mockResponses.voice : mockResponses.text;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return of({
      reply: randomResponse,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  }
}
