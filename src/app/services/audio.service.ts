import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Inicia la grabación de audio desde el micrófono
   * @returns Promise que resuelve cuando la grabación comienza
   */
  async startRecording(): Promise<void> {
    try {
      // Solicitar acceso al micrófono
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Configurar MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      // Evento cuando hay datos disponibles
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Iniciar grabación
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      throw new Error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  }

  /**
   * Detiene la grabación y convierte el audio a Base64
   * @returns Promise que resuelve con el audio en formato Base64
   */
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No hay grabación activa'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Crear blob del audio grabado
          const audioBlob = new Blob(this.audioChunks, {
            type: 'audio/webm;codecs=opus'
          });

          // Convertir a Base64
          const base64Audio = await this.blobToBase64(audioBlob);

          // Limpiar recursos
          this.cleanup();

          resolve(base64Audio);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Convierte un Blob a string Base64
   * @param blob - Blob a convertir
   * @returns Promise que resuelve con el string Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:audio/webm;codecs=opus;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Verifica si actualmente se está grabando
   * @returns true si está grabando, false en caso contrario
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Limpia los recursos de audio
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
