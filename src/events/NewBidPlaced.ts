import eventBus from './EventBus';

/**
 * NewBidPlaced event:
 * Yeni bir teklif verildiğinde tetiklenir.
 */
class NewBidPlaced {
  public static listen() {
    eventBus.on('NewBidPlaced', (payload) => {
      const { auctionId, userId, amount } = payload;
      console.log(`[EVENT] NewBidPlaced -> Kullanıcı #${userId}, açık artırma #${auctionId} için teklif: ${amount}`);

      // Örnek: Diğer teklif verenlere bilgilendirme, log kaydı, vb.
      // NotificationService.notifyAllBidders(auctionId, userId, amount);
    });
  }
}

export default NewBidPlaced;
