import pool from '../db';

class SettingService {
  public static async getValue(key: string): Promise<string | null> {
    const [rows] = await pool.query(
      // `key` sütun adını backtick ile kaçıralım
      'SELECT `value` FROM `settings` WHERE `key` = ?',
      [key]
    );
    if (!(rows as any[]).length) return null;
    return (rows as any[])[0].value;
  }

  public static async setValue(key: string, value: string): Promise<void> {
    // upsert
    const [rows] = await pool.query(
      'SELECT `id` FROM `settings` WHERE `key` = ?',
      [key]
    );

    if ((rows as any[]).length) {
      await pool.query(
        'UPDATE `settings` SET `value` = ?, `updatedAt` = NOW() WHERE `key` = ?',
        [value, key]
      );
    } else {
      await pool.query(
        'INSERT INTO `settings` (`key`, `value`) VALUES (?, ?)',
        [key, value]
      );
    }
  }

  public static async getAll(): Promise<any[]> {
    const [rows] = await pool.query('SELECT * FROM `settings`');
    return rows as any[];
  }
}

export default SettingService;
