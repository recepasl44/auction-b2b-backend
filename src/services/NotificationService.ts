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
  public static async sendEmail(to: string, subject: string, text: string) {
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

    const mailOptions = {
      from: `"B2B Auction" <${fromAddress}>`,
      to,
      subject,
      text
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
  public static async notifyAuctionStarted(auctionId: number, userEmails: string[]) {
    for (const email of userEmails) {
      await NotificationService.sendEmail(
        email,
        'Açık artırma başladı',
        `Merhaba, ID'si ${auctionId} olan açık artırma başladı!`
      );
    }
  }
}

export default NotificationService;
