// AuctionEnded.ts
import eventBus from './EventBus';
import OrderService from '../services/OrderService';

class AuctionEnded {
  public static listen() {
    eventBus.on('AuctionEnded', async (payload) => {
      const { auctionId, winnerId } = payload;
      console.log(`[EVENT] AuctionEnded -> Açık artırma #${auctionId} bitti. Kazanan: ${winnerId}`);

      if (!winnerId) {
        console.log('Teklif yok, sipariş oluşturulamadı');
        return;
      }

      // Son teklifi bul
      // "SELECT amount FROM bids WHERE auctionId=? ORDER BY amount DESC LIMIT 1"
      // Otomatik sipariş oluştur
      const finalPrice = await OrderService.createOrderForWinner(auctionId, winnerId);
      console.log(`Order created with price = ${finalPrice}`);
    });
  }
}

export default AuctionEnded;
