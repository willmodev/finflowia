import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

import { Message, WebhookPayload } from '@models/message.model';
import { ExpenseService } from '@services/expense.service';
import { AudioService } from '@services/audio.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private readonly messagesContainer!: ElementRef;
  @ViewChild('messageInput') private readonly messageInput!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  isRecording: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  private readonly expenseService: ExpenseService = inject(ExpenseService);
  private readonly audioService: AudioService = inject(AudioService);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  /**
   * Envía un mensaje de texto al webhook de n8n
   */
  async sendTextMessage(): Promise<void> {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const messageText = this.currentMessage.trim();
    this.currentMessage = '';
    this.errorMessage = '';
    this.isLoading = true;
  
    // Crear mensaje del usuario para la UI
    const userMessage: Message = {
      id: uuidv4(),
      messageType: 'text',
      textMessage: messageText,
      timestamp: new Date(),
      content: messageText,
      isFromUser: true
    };
  
    // Agregar mensaje del usuario a la lista
    this.messages.push(userMessage);
  
    // Preparar payload para n8n
    const payload: WebhookPayload = {
      id: userMessage.id,
      messageType: 'text',
      textMessage: messageText
    };
  
    try {
      // Enviar al webhook de n8n y esperar respuesta
      const response = await firstValueFrom(this.expenseService.sendExpenseMessage(payload));
  
      // Crear mensaje de respuesta de n8n
      const responseMessage: Message = {
        id: uuidv4(),
        messageType: 'response',
        timestamp: new Date(),
        content: response.reply, // Aquí usas el campo 'reply' de n8n
        isFromUser: false
      };
  
      // Agregar respuesta a la lista
      this.messages.push(responseMessage);
  
      console.log('Mensaje enviado y respuesta recibida:', response.reply);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.errorMessage = 'Error al enviar el mensaje. Inténtalo de nuevo.';
      // Marcar el mensaje como fallido
      userMessage.content += ' ❌';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Maneja el clic en el botón de grabación de voz
   */
  async toggleVoiceRecording(): Promise<void> {
    if (this.isLoading) return;

    try {
      if (!this.isRecording) {
        // Iniciar grabación
        await this.audioService.startRecording();
        this.isRecording = true;
        this.errorMessage = '';
        console.log('Grabación iniciada');
      } else {
        // Detener grabación y procesar
        this.isLoading = true;
        const base64Audio = await this.audioService.stopRecording();
        this.isRecording = false;
  
        // Crear mensaje del usuario para la UI
        const userMessage: Message = {
          id: uuidv4(),
          messageType: 'voice',
          voiceMessage: base64Audio,
          timestamp: new Date(),
          content: '🎤 Nota de voz enviada',
          isFromUser: true
        };
  
        // Agregar mensaje del usuario a la lista
        this.messages.push(userMessage);
  
        // Preparar payload para n8n
        const payload: WebhookPayload = {
          id: userMessage.id,
          messageType: 'voice',
          voiceMessage: base64Audio
        };
  
        try {
          // Enviar al webhook de n8n y esperar respuesta
          const response = await firstValueFrom(this.expenseService.sendExpenseMessage(payload));
  
          // Crear mensaje de respuesta de n8n
          const responseMessage: Message = {
            id: uuidv4(),
            messageType: 'response',
            timestamp: new Date(),
            content: response.reply, // Aquí usas el campo 'reply' de n8n
            isFromUser: false
          };
  
          // Agregar respuesta a la lista
          this.messages.push(responseMessage);
  
          console.log('Nota de voz enviada y respuesta recibida:', response.reply);
        } catch (error) {
          console.error('Error al enviar nota de voz:', error);
          this.errorMessage = 'Error al enviar la nota de voz. Inténtalo de nuevo.';
          userMessage.content += ' ❌';
        }
      }
    } catch (error) {
      console.error('Error con la grabación:', error);
      this.errorMessage = 'Error al acceder al micrófono. Verifica los permisos.';
      this.isRecording = false;
    } finally {
      this.isLoading = false;
    }
  }


  /**
   * Maneja el evento de presionar Enter en el input
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendTextMessage();
    }
  }

  /**
   * Hace scroll hacia abajo en el contenedor de mensajes
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

}
