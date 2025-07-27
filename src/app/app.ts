import { Component, signal } from '@angular/core';
import { ChatComponent } from '@components/chat.component';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('FinFlowIA - Asistente de Gastos Personales');
}
