import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '@services/audio.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button (click)="toggleRecording()" 
            [disabled]="isLoading"
            class="p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transform hover:scale-105 active:scale-95"
            [ngClass]="{
              'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25': isRecording,
              'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600': !isRecording && !isLoading,
              'bg-gray-500 cursor-not-allowed': isLoading
            }" 
            [title]="isRecording ? 'Detener grabación' : 'Grabar nota de voz'">
      
      <!-- Indicador de grabación activa -->
      <div *ngIf="isRecording" class="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
      
      <!-- Icono de micrófono o stop -->
      <app-icon [type]="isRecording ? 'stop' : 'microphone'" 
                [size]="'5'" 
                [customClass]="'text-white transition-transform duration-200'">
      </app-icon>
      
      <!-- Ondas de sonido animadas cuando está grabando -->
      <div *ngIf="isRecording" class="absolute inset-0 rounded-xl">
        <div class="absolute inset-0 rounded-xl bg-red-400 opacity-25 animate-ping"></div>
        <div class="absolute inset-0 rounded-xl bg-red-400 opacity-20 animate-ping" style="animation-delay: 0.5s;"></div>
      </div>
    </button>
    
    <!-- Indicador visual de nivel de audio -->
    <div *ngIf="isRecording" class="mt-2 flex justify-center space-x-1">
      <div *ngFor="let bar of audioLevelBars" 
           class="w-1 bg-red-400 rounded-full transition-all duration-150"
           [style.height.px]="bar.height"
           [style.opacity]="bar.opacity">
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-block;
    }
    
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    .hover\:scale-105:hover {
      transform: scale(1.05);
    }
    
    .active\:scale-95:active {
      transform: scale(0.95);
    }
  `]
})
export class AudioRecorderComponent {
  @Input() isLoading: boolean = false;
  @Output() audioRecorded = new EventEmitter<string>();
  @Output() recordingStateChanged = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<string>();
  
  isRecording: boolean = false;
  audioLevelBars: { height: number; opacity: number }[] = [];
  
  private readonly audioService: AudioService = inject(AudioService);
  private animationFrame?: number;
  
  constructor() {
    // Inicializar barras de nivel de audio
    this.audioLevelBars = Array.from({ length: 5 }, () => ({ height: 4, opacity: 0.3 }));
  }
  
  async toggleRecording(): Promise<void> {
    if (this.isLoading) return;
    
    try {
      if (!this.isRecording) {
        await this.startRecording();
      } else {
        await this.stopRecording();
      }
    } catch (error) {
      console.error('Error en grabación:', error);
      this.error.emit('Error al acceder al micrófono. Verifica los permisos.');
      this.isRecording = false;
      this.recordingStateChanged.emit(false);
    }
  }
  
  private async startRecording(): Promise<void> {
    await this.audioService.startRecording();
    this.isRecording = true;
    this.recordingStateChanged.emit(true);
    this.startAudioLevelAnimation();
    console.log('Grabación iniciada');
  }
  
  private async stopRecording(): Promise<void> {
    const base64Audio = await this.audioService.stopRecording();
    this.isRecording = false;
    this.recordingStateChanged.emit(false);
    this.stopAudioLevelAnimation();
    this.audioRecorded.emit(base64Audio);
    console.log('Grabación detenida');
  }
  
  private startAudioLevelAnimation(): void {
    const animate = () => {
      if (!this.isRecording) return;
      
      // Simular niveles de audio aleatorios
      this.audioLevelBars = this.audioLevelBars.map(() => ({
        height: Math.random() * 20 + 4,
        opacity: Math.random() * 0.7 + 0.3
      }));
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  private stopAudioLevelAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Resetear barras
    this.audioLevelBars = this.audioLevelBars.map(() => ({ height: 4, opacity: 0.3 }));
  }
}