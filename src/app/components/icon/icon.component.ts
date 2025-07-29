import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IconType = 'microphone' | 'stop' | 'send' | 'loading';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [innerHTML]="svgContent" 
      [class]="'w-' + size + ' h-' + size + ' ' + customClass"
      [style.width.px]="sizeInPx"
      [style.height.px]="sizeInPx">
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class IconComponent {
  @Input() type: IconType = 'microphone';
  @Input() size: string = '5';
  @Input() customClass: string = 'text-white';

  constructor(private sanitizer: DomSanitizer) {}

  get sizeInPx(): number {
    return parseInt(this.size) * 4; // Convertir de Tailwind a px (w-5 = 20px)
  }

  get svgContent(): SafeHtml {
    const svgMap: Record<IconType, string> = {
      microphone: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="100%" height="100%">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19v4" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 23h8" />
        </svg>
      `,
      stop: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="100%" height="100%">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      `,
      send: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="100%" height="100%">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      `,
      loading: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="100%" height="100%" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      `
    };

    return this.sanitizer.bypassSecurityTrustHtml(svgMap[this.type] || svgMap.microphone);
  }
}