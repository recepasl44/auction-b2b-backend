import pool from '../db';
import NotificationService from './NotificationService';
import { generateNickname } from '../utils/nickname';

class AuctionInviteService {
  /**
   * Belirli üreticileri bir ihaleye davet et
   */
 public static async inviteManufacturers(
    auctionId: number,
    manufacturerIds: number[]
  ): Promise<void> {
    for (const manId of manufacturerIds) {
      // Check if manufacturer exists to avoid foreign key errors
      const [userRows] = await pool.query('SELECT id FROM users WHERE id = ?', [manId]);
      if (!(userRows as any[]).length) {
        throw new Error(`Manufacturer ${manId} not found`);
      }
      const nickname = generateNickname();

      const insertSql = `
        INSERT INTO auction_invites (auctionId, manufacturerId, inviteStatus, nickname)
        VALUES (?, ?, 'invited', ?)
      `;
      const [insertResult] = await pool.query(insertSql, [auctionId, manId, nickname]);
      const inviteId = (insertResult as any).insertId;

      // Opsiyonel: E-posta gönder
      try {
        const [rows] = await pool.query(`SELECT email FROM users WHERE id = ?`, [manId]);
        if ((rows as any[]).length) {
          const email = (rows as any[])[0].email;
          const subject = 'Yeni Açık Artırma Daveti';
          const auctionLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auctions/${auctionId}`;
          const acceptLink = `${process.env.BASE_URL || 'http://localhost:3000'}/auctions/invites/${inviteId}/accept`;
          const text = `İhaleye katılmak için: ${auctionLink} - Kabul için: ${acceptLink}`;
          const html = `<p>Merhaba,</p>
            <p>${auctionId} numaralı açık artırmaya davet edildiniz.</p>
            <p>Daveti kabul etmek için <a href="${acceptLink}">buraya tıklayın</a>.</p>
            <p>Açık artırmayı incelemek için <a href="${auctionLink}">linke gidin</a>.</p>`;
          await NotificationService.sendEmail(email, subject, text, html);
        }
      } catch (e) {
        console.error('Davet maili gönderilemedi:', e);
      }
    }
  }

  /**
   * Belirli id'li davet kaydı
   */
  public static async getInviteById(inviteId: number): Promise<any | null> {
    const [rows] = await pool.query(`SELECT * FROM auction_invites WHERE id = ?`, [inviteId]);
    if (!(rows as any[]).length) return null;
    return (rows as any[])[0];
  }

  /**
   * Davet edilen ihaleler (üretici bazında)
   */
  public static async getInvitesForAuction(auctionId: number): Promise<any[]> {
      const sql = `
SELECT ai.id as inviteId, ai.inviteStatus, ai.nickname,
      u.id as manufacturerId, u.name as manufacturerName, u.email as manufacturerEmail
      FROM auction_invites ai
      JOIN users u ON ai.manufacturerId = u.id
      WHERE ai.auctionId = ?
    `;
    const [rows] = await pool.query(sql, [auctionId]);
    return rows as any[];
  }
  public static async getInvitesForManufacturer(manufacturerId: number): Promise<any[]> {
    const sql = `
      SELECT ai.id as inviteId, ai.inviteStatus, ai.nickname, ai.auctionId
      FROM auction_invites ai
      WHERE ai.manufacturerId = ?
    `;
    const [rows] = await pool.query(sql, [manufacturerId]);
    return rows as any[];
  }
  public static async respondToInvite(
    inviteId: number,
    action: 'accepted' | 'declined'
  ): Promise<boolean> {
    // Obtain auction and manufacturer ids for the invite so that all
    // invites for the pair can be updated. This avoids cases where
    // duplicate invites exist and an old invite prevents bidding.
    const invite = await this.getInviteById(inviteId);
    if (!invite) {
      return false;
    }

    const sql = `
      UPDATE auction_invites
      SET inviteStatus = ?
      WHERE auctionId = ? AND manufacturerId = ?
    `;
    const [result]: any = await pool.query(sql, [
      action,
      invite.auctionId,
      invite.manufacturerId
    ]);
    return result && result.affectedRows > 0;
  }
    /**
   * Davet durumunu güncelle
   */
  public static async updateInviteStatus(
    auctionId: number,
    manufacturerId: number,
    inviteStatus: string
  ) {
    const sql = `
      UPDATE auction_invites
      SET inviteStatus = ?
      WHERE auctionId = ? AND manufacturerId = ?
    `;
    await pool.query(sql, [inviteStatus, auctionId, manufacturerId]);
  }
}

export default AuctionInviteService;
