import { Client } from 'discord.js';
import Queue from '@kyvrixon/async-queue'; // Import your Queue class

declare module 'discord.js' {
    interface Client {
        queue: Queue<any>; // This adds `queue` property to the Client class with a Queue instance
    }
}
