// F:\b2b-auction-backend\src\sockets\AuctionSocket.ts
import { Server, Socket } from 'socket.io';
import eventBus from '../events/EventBus';
import pool from '../db'; // eğer chat mesajlarını DB'ye kaydedecekseniz
// import AuctionService from '../services/AuctionService'; // gerekirse
// import BidService from '../services/BidService'; // vb.

interface JoinAuctionPayload {
  auctionId: number;
  userId: number;     // Kim katılıyor
  role: string;       // 'manufacturer', 'customer', 'admin' vb.
}

interface ChatMessagePayload {
  auctionId: number;
  userId: number;
  message: string;
}

interface BidPlacedPayload {
  auctionId: number;
  userId: number;
  amount: number;
}

export function initAuctionSocket(io: Server) {
  // Connection -> her yeni websocket bağlantısında tetiklenir
  io.on('connection', (socket: Socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // [1] Kullanıcı ihaleye (auctionId) katılıyor
    const userNicknames = new Map<string, string>(); // socketId => nickname (veya userId => nickname)

    socket.on('joinAuction', (data: JoinAuctionPayload) => {
      const { auctionId, userId, role } = data;
      const roomName = `auction_${auctionId}`;
      socket.join(roomName);
    
      // Rastgele takma ad atayalım
      let nickname = generateRandomNickname();
      userNicknames.set(socket.id, nickname); 
      console.log(`Socket ${socket.id} joined ${roomName} as ${nickname}`);
    });
    // [2] Chat mesajı
    socket.on('auctionChat', async (data: ChatMessagePayload) => {
      const { auctionId, userId, message } = data;
      const roomName = `auction_${auctionId}`;
      const nickname = userNicknames.get(socket.id) || 'Unknown'; 

      // Opsiyonel: DB'ye kaydet
      /* 
      const insertSql = `INSERT INTO auction_chat (auctionId, nickname, message) VALUES (?, ?, ?)`;
      await pool.query(insertSql, [auctionId, 'RandomNick', message]);
      */

      // Odaya yayın
      const payload = {
        nickname,
        message: data.message,
        timestamp: new Date().toISOString(),
      };
      io.to(roomName).emit('auctionChat', payload);
    });
    function generateRandomNickname(): string {
        const randNum = Math.floor(Math.random() * 10000);
        return 'User' + randNum;
      }
      
    // [3] placeBid olayı (opsiyonel: front-end direk /api/auctions/placeBid yapabilir)
    // Eğer front-end placeBid'i Socket üzerinden yapmak isterse:
    socket.on('placeBid', async (data: BidPlacedPayload) => {
      const { auctionId, userId, amount } = data;

      // Normalde bir REST endpoint (AuctionController.placeBid) var.
      // Burada "service" çağırabilir veya Axios yapabilirsiniz.
      // Kolaylık olsun diye basit DB kaydı:
      try {
        await pool.query(`
          INSERT INTO bids (auctionId, userId, amount)
          VALUES (?, ?, ?)
        `, [auctionId, userId, amount]);

        // Odaya yayın
        io.to(`auction_${auctionId}`).emit('bidPlaced', {
          auctionId,
          userId,
          amount,
          timestamp: new Date().toISOString()
        });
        console.log(`User #${userId} placed bid ${amount} on auction #${auctionId}`);
      } catch (err) {
        console.error('placeBid socket error:', err);
        socket.emit('error', { message: 'Teklif verirken hata oluştu.' });
      }
    });

    // [4] Ayrılma
    socket.on('leaveAuction', (data: { auctionId: number; userId: number }) => {
      const { auctionId, userId } = data;
      const roomName = `auction_${auctionId}`;
      socket.leave(roomName);
      console.log(`User #${userId} left room ${roomName}`);
    });

    // Bağlantı kopunca
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  /**
   * [5] EventBus ile AuctionStarted / AuctionEnded olaylarını Socket'e yansıtma
   * Yani backend'te "eventBus.emit('AuctionStarted', { auctionId })" tetiklendiğinde,
   * buradaki dinleyici, o "auctionId"'ye ait odaya mesaj atar.
   */
  eventBus.on('AuctionStarted', (payload) => {
    const { auctionId } = payload;
    const roomName = `auction_${auctionId}`;
    io.to(roomName).emit('auctionStatus', {
      status: 'started',
      auctionId,
      timestamp: new Date().toISOString()
    });
    console.log(`[SOCKET] Auction #${auctionId} -> started`);
  });

  eventBus.on('AuctionEnded', (payload) => {
    const { auctionId, winnerId } = payload;
    const roomName = `auction_${auctionId}`;
    io.to(roomName).emit('auctionStatus', {
      status: 'ended',
      winnerId,
      auctionId,
      timestamp: new Date().toISOString()
    });
    console.log(`[SOCKET] Auction #${auctionId} -> ended. Winner: ${winnerId}`);
  });
}
