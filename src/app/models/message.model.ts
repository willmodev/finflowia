export interface Message {
  id: string;
  messageType: 'text' | 'voice' | 'response';
  textMessage?: string;
  voiceMessage?: string;
  timestamp: Date;
  content: string; // Para mostrar en la UI
  isFromUser?: boolean; // Para distinguir mensajes del usuario vs respuestas de n8n
}

export interface WebhookPayload {
  id: string;
  messageType: 'text' | 'voice';
  textMessage?: string;
  voiceMessage?: string;
}

// Nueva interfaz para la respuesta de n8n
export interface N8nResponse {
  reply: string;
}
