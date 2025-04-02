/**
 * Validates the message structure
 * @param {Object} message - Message to validate
 * @returns {boolean} - True if valid, throws error if invalid
 * @throws {Error} If message structure is invalid
 */

import pkg from 'rascal';
const { BrokerAsPromised } = pkg;
import { BROKER_CONFIG } from "./common/config.js";
import { SAMPLE_MESSAGE } from "./common/message.js";

const validateMessage = (message) => {
    if (!message || typeof message !== 'object') {
        throw new Error('Message must be an object');
    }
    if (!message.item_id || typeof message.item_id !== 'string') {
        throw new Error('Message must contain a string item_id');
    }
    if (!message.text || typeof message.text !== 'string') {
        throw new Error('Message must contain a string text');
    }
    return true;
};

/**
 * Sends a message to RabbitMQ queue using Rascal
 * @param {Object} message - Message to send
 * @returns {Promise<void>}
 */
const sendMessage = async (message) => {
    let broker;
    try {
        // Validate message before attempting to send
        validateMessage(message);

        // Create and initialize broker
        broker = await BrokerAsPromised.create(BROKER_CONFIG);
        
        // Handle broker errors
        broker.on('error', (err, { vhost, connectionUrl }) => {
            console.error('[!] Broker error:', err.message, { vhost, connectionUrl });
        });

        // Publish message with confirmation
        const publication = await broker.publish('inventory_check', message);
        
        // Handle publication events
        publication
            .on('success', () => {
                console.log("[✓] Message sent successfully:", message);
            })
            .on('error', (err) => {
                console.error("[!] Publication error:", err.message);
            })
            .on('return', (msg) => {
                console.warn("[!] Message was returned:", msg.properties.messageId);
            });

    } catch (error) {
        console.error("[!] Error in send operation:", error.message);
        throw error;
    } finally {
        if (broker) {
            try {
                await broker.shutdown();
                console.log("[✓] Broker shutdown complete");
            } catch (error) {
                console.error("[!] Error during broker shutdown:", error.message);
            }
        }
    }
};

// Execute message sending
(async () => {
    try {
        await sendMessage(SAMPLE_MESSAGE);
    } catch (error) {
        process.exit(1);
    }
})();
