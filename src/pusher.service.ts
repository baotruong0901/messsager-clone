import { Injectable } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
    pusher: Pusher
    constructor() {
        this.pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID!,
            key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
            secret: process.env.PUSHER_SECRET!,
            cluster: 'ap1',
            useTLS: true
        });
    }

    async trigger(channel: string, event: string, data: any) {
        await this.pusher.trigger(channel, event, data)
    }
}
