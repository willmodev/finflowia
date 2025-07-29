import { Component, ElementRef, ViewChild, AfterViewChecked, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

import { Message, WebhookPayload } from '@models/message.model';
import { ExpenseService } from '@services/expense.service';
import { MessageComponent } from './message/message.component';
import { AudioRecorderComponent } from './audio-recorder/audio-recorder.component';
import { IconComponent } from './icon/icon.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageComponent, AudioRecorderComponent, IconComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private readonly messagesContainer!: ElementRef;
  @ViewChild('messageInput') private readonly messageInput!: ElementRef;

  // Usando signals para mejor reactividad (Angular 17+)
  messages = signal<Message[]>([]);
  currentMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isRecording = signal<boolean>(false);
  isProcessingAudio = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // Computed signals para estados derivados
  canSendMessage = computed(() => 
    this.currentMessage().trim().length > 0 && 
    !this.isLoading() && 
    !this.isRecording()
  );
  
  canStartRecording = computed(() => 
    !this.currentMessage().trim() && 
    !this.isLoading() && 
    !this.isRecording()
  );
  
  showStopButton = computed(() => this.isRecording());
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private readonly expenseService: ExpenseService = inject(ExpenseService);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  /**
   * Envía un mensaje de texto al webhook de n8n
   */
  async sendTextMessage(): Promise<void> {
    if (!this.canSendMessage()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    const messageContent = this.currentMessage();
    this.currentMessage.set('');
  
    // Crear mensaje del usuario para la UI
    const userMessage: Message = {
      id: uuidv4(),
      messageType: 'text',
      textMessage: messageContent,
      timestamp: new Date(),
      content: messageContent,
      isFromUser: true
    };
  
    // Agregar mensaje del usuario a la lista usando signals
    this.messages.update(messages => [...messages, userMessage]);
  
    // Preparar payload para n8n
    const payload: WebhookPayload = {
      id: userMessage.id,
      messageType: 'text',
      textMessage: messageContent
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
  
      // Agregar respuesta a la lista usando signals
      this.messages.update(messages => [...messages, responseMessage]);
  
      console.log('Mensaje enviado y respuesta recibida:', response.reply);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.errorMessage.set('❌ Error al enviar el mensaje. Verifica tu conexión e inténtalo de nuevo.');
      // Marcar el mensaje como fallido
      userMessage.content += ' ❌';
      // Actualizar el mensaje en la lista
      this.messages.update(messages => 
        messages.map(msg => msg.id === userMessage.id ? userMessage : msg)
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Maneja cuando se graba un audio
   */
  async onAudioRecorded(base64Audio: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Crear mensaje del usuario para la UI
    const userMessage: Message = {
      id: uuidv4(),
      messageType: 'voice',
      voiceMessage: base64Audio,
      timestamp: new Date(),
      content: '🎤 Nota de voz enviada',
      isFromUser: true
    };

    // Agregar mensaje del usuario a la lista usando signals
    this.messages.update(messages => [...messages, userMessage]);

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
        content: response.reply,
        isFromUser: false
      };

      // Agregar respuesta a la lista usando signals
      this.messages.update(messages => [...messages, responseMessage]);

      console.log('Nota de voz enviada y respuesta recibida:', response.reply);
    } catch (error) {
      console.error('Error al enviar nota de voz:', error);
      this.errorMessage.set('🎤 Error al procesar la nota de voz. Verifica tu conexión e inténtalo de nuevo.');
      userMessage.content += ' ❌';
      // Actualizar el mensaje en la lista
      this.messages.update(messages => 
        messages.map(msg => msg.id === userMessage.id ? userMessage : msg)
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Maneja el cambio de estado de grabación
   */
  onRecordingStateChanged(isRecording: boolean): void {
    this.isRecording.set(isRecording);
  }

  /**
   * Maneja errores del componente de audio
   */
  onAudioError(error: string): void {
    this.errorMessage.set(error);
  }

  // Métodos para manejar grabación de audio
  startRecording(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.isRecording.set(true);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          
          this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
          };
          
          this.mediaRecorder.onstop = () => {
            console.log('MediaRecorder onstop event triggered');
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.convertBlobToBase64AndSend(audioBlob);
            stream.getTracks().forEach(track => track.stop());
          };
          
          this.mediaRecorder.start();
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          this.errorMessage.set('🎤 Error al acceder al micrófono. Verifica los permisos.');
          this.isRecording.set(false);
        });
    } else {
      this.errorMessage.set('🎤 Tu navegador no soporta grabación de audio');
    }
  }

  stopRecording(): void {
    console.log('stopRecording called, isRecording:', this.isRecording, 'isProcessingAudio:', this.isProcessingAudio, 'mediaRecorder state:', this.mediaRecorder?.state);
    
    // Evitar múltiples clics mientras se procesa
    if (this.isProcessingAudio()) {
      console.log('Already processing audio, ignoring click');
      return;
    }
    
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      this.isProcessingAudio.set(true);
      this.mediaRecorder.stop();
      console.log('MediaRecorder stopped, processing audio...');
      // No cambiar isRecording aquí - se cambiará cuando se procese el audio
    } else if (this.isRecording()) {
      // Si por alguna razón el mediaRecorder no está disponible pero isRecording es true
      console.log('Forcing stop - mediaRecorder not in recording state');
      this.isRecording.set(false);
      this.isProcessingAudio.set(false);
      this.errorMessage.set('🎤 Error al detener la grabación');
    }
  }

  // Método para convertir Blob a base64 y enviar
  private convertBlobToBase64AndSend(audioBlob: Blob): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      // Remover el prefijo "data:audio/wav;base64," si existe
      const base64Data = base64Audio.split(',')[1] || base64Audio;
      // Cambiar el estado de grabación antes de enviar
      this.isRecording.set(false);
      this.isProcessingAudio.set(false);
      console.log('Audio processed and ready to send');
      this.onAudioRecorded(base64Data);
    };
    reader.onerror = () => {
      console.error('Error reading audio file');
      this.isRecording.set(false);
      this.isProcessingAudio.set(false);
      this.errorMessage.set('🎤 Error al procesar el audio');
    };
    reader.readAsDataURL(audioBlob);
  }

  // Método para ajustar altura del textarea
  adjustTextareaHeight(): void {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }

  /**
   * Función de tracking para ngFor optimizado
   */
  trackByMessageId(index: number, message: Message): string {
    return message.id;
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
