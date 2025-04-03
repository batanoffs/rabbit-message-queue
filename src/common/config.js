import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in project root
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Verify environment variables are loaded
const requiredEnvVars = ['MQ_HOST', 'MQ_PORT', 'MQ_USER', 'MQ_PASS'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

/**
 * Rascal broker configuration
 * @constant {Object}
 */

export const BROKER_CONFIG = {
    vhosts: {
        "/": {
            connection: {
                hostname: process.env.MQ_HOST,
                port: process.env.MQ_PORT,
                user: process.env.MQ_USER,
                password: process.env.MQ_PASS,
                protocol: "AMQP",
            },
            queues: {
                feeds: {
                    options: {
                        arguments: {},
                    },
                },
            },
            subscriptions: {
                feeds: {
                    queue: "feeds",
                    prefetch: 5,
                },
            },
        },
    },
};

// /**
//  * Rascal broker configuration
//  * @constant {Object}
//  */

// export const BROKER_CONFIG = {
//     vhosts: {
//         "/": {
//             connection: {
//                 url: "amqp://localhost"
//             },
//             queues: {
//                 "product_inventory": {
//                     options: {
//                         durable: false
//                     }
//                 }
//             },
//             publications: {
//                 "inventory_check": {
//                     queue: "product_inventory",
//                     confirm: true
//                 }
//             },
//             subscriptions: {
//                 "inventory_listener": {
//                     queue: "product_inventory",
//                     prefetch: 10
//                 }
//             }
//         }
//     }
// };
