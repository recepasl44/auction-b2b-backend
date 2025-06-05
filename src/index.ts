// F:\b2b-auction-backend\src\index.ts
import dotenv from 'dotenv';
dotenv.config(); // .env dosyasını yükle

// Sunucu ve DB işlemlerinin Türkiye saatine göre çalışması için
process.env.TZ = 'Europe/Istanbul';

import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Rotalar
import authRouter from './routes/authRoutes';
import auctionRouter from './routes/auctionRoutes';
import productionRequestRouter from './routes/productionRequestRoutes';
import orderRouter from './routes/orderRoutes';
import paymentRouter from './routes/paymentRoutes';
import shipmentRouter from './routes/shipmentRoutes';
import reportRouter from './routes/reportRoutes';
import userRouter from './routes/userRoutes';
import productRouter from './routes/productRoutes';
import settingRouter from './routes/settingRoutes';
import imageRouter from './routes/imageRoutes';
import { initAuctionSocket } from './sockets/AuctionSocket';
import path from 'path';
// Middleware
import { errorHandler } from './middlewares/errorHandler';

// Event listener örnekleri (Events klasöründeki .listen() metodları)
import AuctionStarted from './events/AuctionStarted';
import AuctionEnded from './events/AuctionEnded';
import NewBidPlaced from './events/NewBidPlaced';
import PaymentReceived from './events/PaymentReceived';
import eventBus from './events/EventBus';
import productAttributeRouter from './routes/productAttributeRoutes';
import dashboardRouter from './routes/dashboardRoutes';

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
initAuctionSocket(io);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Socket.IO: Client bağlantısı ve oda katılımı
io.on('connection', (socket) => {
  console.log('Bir client bağlandı:', socket.id);

  // Client'ın belirli bir açık artırma odasına katılması için event ekleyin:
  socket.on('joinAuction', (auctionId: number) => {
    const roomName = `auction_${auctionId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('Client ayrıldı:', socket.id);
  });
});

// EventBus üzerinden gelen 'NewBidPlaced' eventini Socket.IO ile yayalım:
eventBus.on('NewBidPlaced', (payload) => {
  // Örneğin: "auction_1" odasındaki tüm client'lara 'bidUpdated' eventini gönder:
  io.to(`auction_${payload.auctionId}`).emit('bidUpdated', payload);
});

app.use('/auth', authRouter);
app.use('/auctions', auctionRouter);
app.use('/productionRequests', productionRequestRouter);
app.use('/orders', orderRouter);
app.use('/payments', paymentRouter);
app.use('/shipments', shipmentRouter);
app.use('/reports', reportRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/settings', settingRouter);
app.use('/images', imageRouter);
app.use('/productAttributes', productAttributeRouter);
app.use('/dashboard', dashboardRouter);

// Eventleri dinlemeye başlama
AuctionStarted.listen();
AuctionEnded.listen();
NewBidPlaced.listen();
PaymentReceived.listen();

// Basit test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'B2B Auction Backend API is running.' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
