import eventBus from './EventBus';

/**
 * PaymentReceived event:
 * Bir ödeme yapıldığında tetiklenir (örneğin, PaymentController'da isPaid = true olunca).
 */
class PaymentReceived {
  public static listen() {
    eventBus.on('PaymentReceived', (payload) => {
      const { paymentScheduleId, orderId, amount } = payload;
      console.log(`[EVENT] PaymentReceived -> Sipariş #${orderId} için ödeme alındı. (PlanID: ${paymentScheduleId}, Tutar: ${amount})`);

      // Örnek işlem: Faturayı oluşturma, muhasebe bildirimi, vb.
      // InvoiceService.generateInvoice(orderId, amount);
    });
  }
}

export default PaymentReceived;
