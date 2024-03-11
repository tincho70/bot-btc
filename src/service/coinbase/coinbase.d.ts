export interface CoinbaseMessage {
  type: string;
  sequence: number;
  product_id: string;
  price: number;
  open_24h: number;
  volume_24h: number;
  low_24h: number;
  high_24h: number;
  volume_30d: number;
  best_bid: number;
  best_bid_size: number;
  best_ask: number;
  best_ask_size: number;
  side: string;
  time: string;
  trade_id: number;
  last_size: number;
}
