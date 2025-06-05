// F:\b2b-auction-backend\src\services\CurrencyConversionService.ts
import pool from '../db';
import axios from 'axios';

/**
 * CurrencyConversionService:
 *  - Para birimi dönüştürme, DB'deki currency tablosundan kur bilgisi,
 *  - veya harici API entegrasyonu (fixer.io, exchangerate.host vb.)
 */
class CurrencyConversionService {
  /**
   * DB'deki currency tablosundan base ve target para birimlerini alıp oranı hesaplar.
   */
  public static async getExchangeRate(base: string, target: string): Promise<number> {
    const baseCode = (base || '').trim().toUpperCase();
    const targetCode = (target || '').trim().toUpperCase();

    if (!baseCode || !targetCode) {
      throw new Error('Currency code missing');
    }

    if (baseCode === targetCode) {
      return 1;
    }

    const [baseRows] = await pool.query(
      `SELECT exchange_rate FROM currencies WHERE code = ?`,
      [baseCode]
    );
    const [targetRows] = await pool.query(
      `SELECT exchange_rate FROM currencies WHERE code = ?`,
      [targetCode]
    );

    if (!(baseRows as any[]).length || !(targetRows as any[]).length) {
      throw new Error('Geçersiz para birimi');
    }

    const baseRate = (baseRows as any[])[0].exchange_rate;
    const targetRate = (targetRows as any[])[0].exchange_rate;
    if (!baseRate || !targetRate) {
      throw new Error('Kur bilgisi eksik');
    }

    const rate = targetRate / baseRate;
    return rate;
  }

  /**
   * Belirli tutarı (amount) base'ten target'a dönüştürür.
   */
  public static async convertAmount(
    amount: number,
    base: string,
    target: string
  ): Promise<number> {
    const baseCode = (base || '').trim().toUpperCase();
    const targetCode = (target || '').trim().toUpperCase();

    if (!baseCode || !targetCode) {
      throw new Error('Currency code missing');
    }
    const rate = await CurrencyConversionService.getExchangeRate(baseCode, targetCode);
    return amount * rate;
  }

  /**
   * Harici API ile anlık kurlar (opsiyonel).
   */
  public static async fetchExternalRates(): Promise<any> {
    const apiKey = process.env.CURRENCY_API_KEY || 'test_api_key';
    const response = await axios.get(`https://api.exchangerate.host/latest?access_key=${apiKey}`);
    return response.data;
  }
}

export default CurrencyConversionService;
