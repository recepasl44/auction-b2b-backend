import EventEmitter from 'events';

class AuctionEventBus extends EventEmitter {}

const eventBus = new AuctionEventBus();

export default eventBus;
