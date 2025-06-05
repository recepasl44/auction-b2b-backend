// F:\b2b-auction-backend\src\services\NotificationService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded even if this service is used standalone
dotenv.config();
/**
 * NotificationService:
 *  - E-posta veya diğer bildirim kanalları üzerinden mesaj gönderme örneği.
 */
class NotificationService {
  /**
   * Basit e-posta gönderimi (nodemailer).
   * Gerçek projede .env'den mail host, user, pass değerlerini alabilirsiniz.
   */
  public static async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.yandex.com.tr',
      port: parseInt(process.env.MAIL_PORT || '465', 10),
      secure: (process.env.MAIL_SECURE || 'true') === 'true',
      auth: {
        user: process.env.MAIL_USER || 'dev@recepaslan.com.tr',
        pass: process.env.MAIL_PASS || 'ASLANr-3'
      }
    });
    const fromAddress = process.env.MAIL_FROM || process.env.MAIL_USER || 'no-reply@auction.com';

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"B2B Auction" <${fromAddress}>`,
      to,
      subject,
      text,
      html
    };

   try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Örnek: Açık artırma başladı, kullanıcılara duyuru
   */
  public static async notifyAuctionStarted(
    auctionId: number,
    userEmails: string[]
  ) {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auctions/${auctionId}`;
    const text = `İhaleye katılmak için: ${link}`;
    const html = `<p>Merhaba,</p><p>${auctionId} numaralı açık artırma başladı.</p><p><a href="${link}">İhaleye Git</a></p>`;
    for (const email of userEmails) {
      await NotificationService.sendEmail(email, 'Açık artırma başladı', text, html);
    }
  }
}

export default NotificationService;
