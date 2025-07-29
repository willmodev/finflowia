import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '@models/message.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4 flex transition-all duration-300 ease-in-out" 
         [ngClass]="{
           'justify-end': message.isFromUser,
           'justify-start': !message.isFromUser
         }">
      <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105" 
           [ngClass]="{
             'bg-gradient-to-r from-blue-600 to-blue-700 text-white': message.isFromUser,
             'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100': !message.isFromUser
           }">
        
        <!-- Contenido del mensaje -->
        <div class="flex items-start space-x-2">
          <!-- Avatar para mensajes de IA -->
          <div *ngIf="!message.isFromUser" class="flex-shrink-0">
            <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
              🤖
            </div>
          </div>
          
          <div class="flex-1">
            <!-- Texto del mensaje -->
            <p class="text-sm leading-relaxed break-words">{{ message.content }}</p>
            
            <!-- Timestamp -->
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs opacity-70">
                {{ message.timestamp | date:'short' }}
              </p>
              
              <!-- Indicador de tipo de mensaje -->
              <span *ngIf="message.messageType === 'voice'" 
                    class="text-xs opacity-70 flex items-center space-x-1">
                <span>🎤</span>
              </span>
              
              <!-- Estado de entrega para mensajes del usuario -->
              <span *ngIf="message.isFromUser" 
                    class="text-xs opacity-70">
                ✓
              </span>
            </div>
          </div>
          
          <!-- Avatar para mensajes del usuario -->
          <div *ngIf="message.isFromUser" class="flex-shrink-0">
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
              👤
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .hover\:scale-105:hover {
      transform: scale(1.02);
    }
  `]
})
export class MessageComponent {
  @Input() message!: Message;
}