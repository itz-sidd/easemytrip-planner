interface ExchangeRateResponse {
  result: string;
  conversion_rates: {
    INR: number;
  };
}

interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
}

class CurrencyService {
  private static instance: CurrencyService;
  private exchangeRate: number | null = null;
  private lastFetch: number = 0;
  private readonly cacheDuration = 1000 * 60 * 60; // 1 hour
  private readonly baseUrl = 'https://v6.exchangerate-api.com/v6/latest/USD';

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async getExchangeRate(): Promise<number> {
    const now = Date.now();
    
    // Return cached rate if still valid
    if (this.exchangeRate && (now - this.lastFetch) < this.cacheDuration) {
      return this.exchangeRate;
    }

    try {
      const response = await fetch(this.baseUrl);
      const data: ExchangeRateResponse = await response.json();
      
      if (data.result === 'success' && data.conversion_rates.INR) {
        this.exchangeRate = data.conversion_rates.INR;
        this.lastFetch = now;
        return this.exchangeRate;
      }
      
      throw new Error('Failed to fetch exchange rate');
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback to approximate rate if API fails
      return 83.0;
    }
  }

  async convertToINR(amountUSD: number): Promise<CurrencyConversion> {
    const rate = await this.getExchangeRate();
    const convertedAmount = amountUSD * rate;
    
    return {
      amount: amountUSD,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      convertedAmount,
      exchangeRate: rate
    };
  }

  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Convert USD budget ranges to INR
  async convertBudgetRange(minUSD: number, maxUSD: number): Promise<{min: number, max: number, formatted: string}> {
    const rate = await this.getExchangeRate();
    const minINR = minUSD * rate;
    const maxINR = maxUSD * rate;
    
    return {
      min: minINR,
      max: maxINR,
      formatted: `${this.formatINR(minINR)} - ${this.formatINR(maxINR)}`
    };
  }
}

export const currencyService = CurrencyService.getInstance();
export type { CurrencyConversion };