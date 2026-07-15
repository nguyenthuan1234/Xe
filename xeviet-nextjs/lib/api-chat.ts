import { apiFetch } from "./api";

export interface ApiConversation {
  _id: string;
  car: { _id: string; name: string; price: number; images: string[] } | string;
  buyer: { _id: string; name: string; avatar?: string } | string;
  seller: { _id: string; name: string; avatar?: string } | string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface ApiMessage {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  createdAt: string;
}

export function startConversation(carId: string) {
  return apiFetch<ApiConversation>("/conversations/start", {
    method: "POST",
    body: JSON.stringify({ carId }),
  });
}

export function fetchConversations() {
  return apiFetch<ApiConversation[]>("/conversations");
}

export function fetchMessages(conversationId: string) {
  return apiFetch<ApiMessage[]>(`/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: string, content: string) {
  return apiFetch<ApiMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
