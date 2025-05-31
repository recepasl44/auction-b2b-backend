import eventBus from './EventBus';

/**
 * AuctionStarted event:
 * Açık artırma başladığında tetiklenir.
 * Örnek: eventBus.emit('AuctionStarted', { auctionId: 123 });
 */
class AuctionStarted {
  public static listen() {
    // AuctionStarted eventini yakalayan bir dinleyici
    eventBus.on('AuctionStarted', (payload) => {
      const { auctionId } = payload;
      console.log(`[EVENT] AuctionStarted -> Açık artırma başladı (ID: ${auctionId})`);

      // Burada e-posta, bildirim veya log işlemleri yapabilirsiniz.
      // Örnek: NotificationService.sendAuctionStartEmail(auctionId);
    });
  }
}

export default AuctionStarted;
