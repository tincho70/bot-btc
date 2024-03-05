/* eslint-disable @typescript-eslint/no-unused-vars */
export interface Guild {
  id: string;
  joined_at: Date;
  channel_id?: string;
  interval?: number;
  next_announcement?: number;
}

export interface Partial<Guild> {
  [key: string]: unknown;
}
