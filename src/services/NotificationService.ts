// F:\b2b-auction-backend\src\services\NotificationService.ts
import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Ensure environment variables are loaded even if this service is used standalone
dotenv.config();
/**
 * NotificationService:
 *  - E-posta veya diğer bildirim kanalları üzerinden mesaj gönderme örneği.
 */
class NotificationService {
  /** Path to logo image used in all emails */
  private static logoPath =
    process.env.EMAIL_LOGO_PATH ||
    path.resolve(__dirname, '../../uploads/image.png');

  /**
   * Translate common Turkish phrases in the provided content to English.
   * This simple dictionary-based approach avoids external dependencies.
   */
  private static translateToEnglish(content: string): string {
    const translations: Record<string, string> = {
      'Merhaba': 'Hello',
      'Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın.':
        'Click the link below to verify your account.',
      'Hesabı Doğrula': 'Verify Account',
      'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanabilirsiniz.':
        'You can use the link below to reset your password.',
      'Şifreyi Sıfırla': 'Reset Password',
      'Şifre Sıfırlama': 'Password Reset',
      'E-posta Doğrulama': 'Email Verification',
      'Giriş Yap': 'Login',
      'Hesabınız yönetici tarafından onaylandı.':
        'Your account has been approved by the administrator.',
      'Hesabınız Onaylandı': 'Account Approved',
      'Daveti kabul etmek için': 'To accept the invitation',
      'Açık artırmayı incelemek için': 'To view the auction',
      'Yeni Açık Artırma Daveti': 'New Auction Invitation',
      'Açık artırma başladı': 'Auction Started'
    };

    for (const [tr, en] of Object.entries(translations)) {
      const regex = new RegExp(tr, 'g');
      content = content.replace(regex, en);
    }
    return content;
  }

  /** Wraps raw HTML content with a polished template and embedded logo */
  private static wrapWithTemplate(content: string): string {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; margin:0; padding:30px; }
            .container { max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #ddd; border-radius:8px; overflow:hidden; }
            .header { background:#fafafa; text-align:center; padding:20px; }
            .content { padding:30px; color:#333; font-size:15px; line-height:1.6; }
            .footer { background:#fafafa; text-align:center; padding:15px; color:#999; font-size:12px; }
            a.button { display:inline-block; background:#007bff; color:#ffffff; padding:10px 20px; border-radius:4px; text-decoration:none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:logo" alt="Logo" style="max-width:200px;" />
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">&copy; ${year} B2B Auction</div>
          </div>
        </body>
      </html>
    `;
  }
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
    // Translate text and HTML content to English before sending
    const translatedText = NotificationService.translateToEnglish(text);
    let translatedHtml = html ? NotificationService.translateToEnglish(html) : undefined;

    let finalHtml = translatedHtml;
    const attachments: Attachment[] = [];
    if (translatedHtml) {
      finalHtml = NotificationService.wrapWithTemplate(translatedHtml);
      if (fs.existsSync(NotificationService.logoPath)) {
        attachments.push({
          filename: 'logo.png',
          path: NotificationService.logoPath,
          cid: 'logo'
        });
      }
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"B2B Auction" <${fromAddress}>`,
      to,
      subject,
      text: translatedText,
      html: finalHtml,
      attachments
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
