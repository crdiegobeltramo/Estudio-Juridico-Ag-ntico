/**
 * @file mercadopago.service.ts
 * @description Backend service for managing Mercado Pago API interactions securely.
 * Handles checkout preferences, recurring payment links, payment verification, and wallet settings.
 */

export interface MPItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: 'ARS';
}

export interface MPPreferenceRequest {
  planId: string;
  title: string;
  price: number;
  payerEmail: string;
  payerName?: string;
  externalReference?: string;
  backUrls?: {
    success: string;
    failure: string;
    pending: string;
  };
}

export interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  external_reference?: string;
  collector_id?: number;
  date_created: string;
}

export interface MPPaymentStatus {
  paymentId?: string;
  preferenceId?: string;
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'mock_confirmed';
  statusDetail?: string;
  amount: number;
  payerEmail: string;
  paymentMethod?: string;
  dateApproved?: string;
}

export interface MPWalletConfig {
  collectorEmail: string;
  collectorName: string;
  alias: string;
  cvu: string;
  currency: string;
  status: 'conectada' | 'pendiente_token' | 'modo_sandbox';
  isWebhookActive: boolean;
}

class MercadoPagoService {
  private readonly baseUrl = 'https://api.mercadopago.com';

  private walletConfig: MPWalletConfig = {
    collectorEmail: 'lucianacervelli@hotmail.com',
    collectorName: 'Dra. Luciana Cervelli',
    alias: process.env.MERCADO_PAGO_WALLET_ALIAS || 'ANSIA.ALZAR.BUZOS.MP',
    cvu: process.env.MERCADO_PAGO_WALLET_CVU || '0000003100080194840969',
    currency: 'ARS (Pesos Argentinos)',
    status: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'conectada' : 'modo_sandbox',
    isWebhookActive: true,
  };

  // In-memory payment ledger for tracking confirmed subscriptions
  private paymentsLedger: Map<string, MPPaymentStatus> = new Map();

  /**
   * Retrieves current Mercado Pago Access Token from server environment.
   */
  private getAccessToken(): string | undefined {
    return process.env.MERCADO_PAGO_ACCESS_TOKEN;
  }

  /**
   * Retrieves current Mercado Pago Public Key.
   */
  public getPublicKey(): string {
    return process.env.MERCADO_PAGO_PUBLIC_KEY || 'TEST-98f24a1b-c72e-4b91-a182-94b281f08219';
  }

  /**
   * Returns current wallet configuration.
   */
  public getWalletConfig(): MPWalletConfig {
    return {
      ...this.walletConfig,
      status: this.getAccessToken() ? 'conectada' : 'modo_sandbox',
    };
  }

  /**
   * Updates wallet details (Alias, CVU, Collector Name/Email).
   */
  public updateWalletConfig(newConfig: Partial<MPWalletConfig>): MPWalletConfig {
    if (newConfig.alias) this.walletConfig.alias = newConfig.alias.trim().toUpperCase();
    if (newConfig.cvu) this.walletConfig.cvu = newConfig.cvu.trim();
    if (newConfig.collectorName) this.walletConfig.collectorName = newConfig.collectorName.trim();
    if (newConfig.collectorEmail) this.walletConfig.collectorEmail = newConfig.collectorEmail.trim();
    return this.getWalletConfig();
  }

  /**
   * Creates a checkout preference on Mercado Pago API or generates a safe sandbox preference.
   */
  public async createPaymentPreference(params: MPPreferenceRequest): Promise<{
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
    wallet: MPWalletConfig;
    isSandbox: boolean;
  }> {
    const accessToken = this.getAccessToken();
    const appUrl = process.env.APP_URL || '';

    const payload = {
      items: [
        {
          id: params.planId,
          title: `Academia Virtual del Derecho — ${params.title}`,
          description: `Membresía oficial AVD. Acreditación directa: ${this.walletConfig.collectorName}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(params.price) || 9900,
        },
      ],
      payer: {
        email: params.payerEmail || this.walletConfig.collectorEmail,
        name: params.payerName || 'Cliente Suscriptor',
      },
      back_urls: params.backUrls || {
        success: `${appUrl}/?status=approved&plan=${params.planId}`,
        failure: `${appUrl}/?status=failure&plan=${params.planId}`,
        pending: `${appUrl}/?status=pending&plan=${params.planId}`,
      },
      auto_return: 'approved',
      external_reference: params.externalReference || `avd_${params.planId}_${Date.now()}`,
      statement_descriptor: 'ACADEMIA DERECHO',
      binary_mode: true,
    };

    // If live or sandbox access token is configured, call Mercado Pago API
    if (accessToken) {
      try {
        const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'X-Integrator-Id': 'dev_avd_argentina',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const mpData = (await response.json()) as MPPreferenceResponse;
          
          // Register in ledger
          this.paymentsLedger.set(mpData.id, {
            preferenceId: mpData.id,
            status: 'pending',
            amount: params.price,
            payerEmail: params.payerEmail,
          });

          return {
            preferenceId: mpData.id,
            initPoint: mpData.init_point,
            sandboxInitPoint: mpData.sandbox_init_point,
            wallet: this.getWalletConfig(),
            isSandbox: false,
          };
        } else {
          const errText = await response.text();
          console.warn('[MercadoPagoService] Error en respuesta de MP API:', errText);
        }
      } catch (error) {
        console.error('[MercadoPagoService] Error al conectar con MP API:', error);
      }
    }

    // Fallback: Safe sandbox simulation mode
    const simulatedPrefId = `pref_mp_${Date.now()}`;
    const simulatedLink = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${simulatedPrefId}`;

    this.paymentsLedger.set(simulatedPrefId, {
      preferenceId: simulatedPrefId,
      status: 'pending',
      amount: params.price,
      payerEmail: params.payerEmail,
    });

    return {
      preferenceId: simulatedPrefId,
      initPoint: simulatedLink,
      sandboxInitPoint: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${simulatedPrefId}`,
      wallet: this.getWalletConfig(),
      isSandbox: true,
    };
  }

  /**
   * Verifies the status of a payment by checking Mercado Pago's /v1/payments/:id API
   * or querying the local ledger.
   */
  public async checkPaymentStatus(id: string): Promise<MPPaymentStatus> {
    const accessToken = this.getAccessToken();

    // If id is a numeric MP Payment ID and token exists, query official MP API
    if (accessToken && /^\d+$/.test(id)) {
      try {
        const res = await fetch(`${this.baseUrl}/v1/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const paymentStatus: MPPaymentStatus = {
            paymentId: String(data.id),
            status: data.status,
            statusDetail: data.status_detail,
            amount: data.transaction_amount,
            payerEmail: data.payer?.email || '',
            paymentMethod: data.payment_method_id,
            dateApproved: data.date_approved,
          };
          this.paymentsLedger.set(id, paymentStatus);
          return paymentStatus;
        }
      } catch (err) {
        console.error('[MercadoPagoService] Error consultando estado en MP:', err);
      }
    }

    // Check in-memory ledger
    const existing = this.paymentsLedger.get(id);
    if (existing) {
      return existing;
    }

    // Default response for unregistered IDs
    return {
      preferenceId: id,
      status: 'pending',
      amount: 0,
      payerEmail: this.walletConfig.collectorEmail,
      statusDetail: 'Esperando confirmación de la pasarela de pagos',
    };
  }

  /**
   * Manually confirms a subscription payment (e.g. following direct CVU/Alias transfer
   * or manual administrative approval).
   */
  public confirmPaymentManually(id: string, planId: string, amount: number, payerEmail: string): MPPaymentStatus {
    const status: MPPaymentStatus = {
      preferenceId: id,
      status: 'approved',
      statusDetail: 'Acreditado y verificado en la billetera de Mercado Pago',
      amount,
      payerEmail,
      paymentMethod: 'Mercado Pago Transferencia / Checkout Pro',
      dateApproved: new Date().toISOString(),
    };
    this.paymentsLedger.set(id, status);
    return status;
  }
}

export const mercadoPagoService = new MercadoPagoService();
