import { EventEmitter } from 'events';

export type PlanType = 'free' | 'pro' | 'team';
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NGN' | 'GHS' | 'KES' | 'ZAR';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled';

export interface CheckoutOptions {
  plan?: PlanType;
  seats?: number;
  currency?: SupportedCurrency | string;
  email: string;
  metadata?: Record<string, any>;
}

export interface CheckoutResult {
  orderId: string;
  gateway: string;
  currency: string;
  amount: number;
  plan: PlanType;
  seats: number;
  customerEmail: string;
  status: OrderStatus;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface WebhookOptions {
  gatewayName: 'stripe' | 'paystack';
  rawPayload: string | Record<string, any>;
  signature: string;
}

export interface WebhookResult {
  handled: boolean;
  duplicate?: boolean;
  reason?: string;
  payment?: UnifiedPayment;
}

export class UnifiedPayment {
  id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  customerEmail: string;
  rawReference: string;
  metadata: Record<string, any>;
  timestamp: number;

  constructor(options: {
    id: string;
    gateway: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed';
    customerEmail: string;
    rawReference: string;
    metadata?: Record<string, any>;
  });
}

export class StripeAdapter {
  apiKey: string;
  webhookSecret?: string;
  name: 'stripe';
  constructor(apiKey: string, webhookSecret?: string);
  supportsCurrency(currency: string): boolean;
  verifyWebhook(rawPayload: string | object, signature: string): boolean;
  normalizeWebhook(event: string | object): UnifiedPayment | null;
}

export class PaystackAdapter {
  apiKey: string;
  webhookSecret?: string;
  name: 'paystack';
  constructor(apiKey: string, webhookSecret?: string);
  supportsCurrency(currency: string): boolean;
  verifyWebhook(rawPayload: string | object, signature: string): boolean;
  normalizeWebhook(event: string | object): UnifiedPayment | null;
}

export interface KoraConfig {
  stripe?: { apiKey: string; webhookSecret?: string };
  paystack?: { apiKey: string; webhookSecret?: string };
}

export class KoraPay {
  constructor(config?: KoraConfig);
  resolveGateway(currency: string): StripeAdapter | PaystackAdapter;
  calculatePlanTotal(plan: PlanType, seats: number): number;
  initializeCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
  handleWebhook(options: WebhookOptions): Promise<WebhookResult>;
}

export function calculatePrice(plan: PlanType, seats: number): number;
export function formatCurrency(amount: number, currency?: string): string;

export class Order extends EventEmitter {
  id: string;
  status: OrderStatus;
  history: Array<{ status: OrderStatus; at: number }>;
  constructor(id: string);
  setStatus(status: OrderStatus): void;
}

export function createOrder(): Promise<Order>;
export function getOrder(id: string): Promise<Order | undefined>;
export function sendWebhook(id: string, type: string): Promise<void>;
export function waitForStatus(order: Order, status: OrderStatus, options?: { timeout?: number }): Promise<void>;
