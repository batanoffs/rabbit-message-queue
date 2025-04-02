// Import the Rascal package and the broker configuration
import pkg from 'rascal';
import { BROKER_CONFIG } from "./common/config.js";

const { BrokerAsPromised } = pkg;

/**
 * Validates the received message structure
 * @param {Object} message - Message to validate
 * @returns {boolean} - True if valid, throws error if invalid
 * @throws {Error} If message structure is invalid
 */

const validateMessage = (message) => {
    if (!message || typeof message !== 'object') {
        throw new Error('Invalid message format: not an object');
    }
    if (!message.item_id || typeof message.item_id !== 'string') {
        throw new Error('Invalid message: missing or invalid item_id');
    }
    if (!message.text || typeof message.text !== 'string') {
        throw new Error('Invalid message: missing or invalid text');
    }
    return true;
};

/**
 * Sets up and starts the message receiver using Rascal
 * @returns {Promise<void>}
 */

const startReceiver = async () => {
    let broker;

    try {
        // Create and initialize broker
        broker = await BrokerAsPromised.create(BROKER_CONFIG);
        
        // Handle broker errors
        broker.on('error', (err, { vhost, connectionUrl }) => {
            console.error('[!] Broker error:', err.message, { vhost, connectionUrl });
        });

        // Subscribe to messages
        const subscription = await broker.subscribe('inventory_listener');
        
        console.log("[*] Waiting for messages. To exit press CTRL+C");

        // Handle subscription events
        subscription
            .on('message', (message, content, ackOrNack) => {
                try {
                    // Validate and process message
                    validateMessage(content);
                    console.log("[✓] Received message:", content);
                    ackOrNack();
                } catch (error) {
                    console.error("[!] Processing error:", error.message);
                    // Nack without requeue on validation errors
                    ackOrNack(error, { strategy: 'nack', requeue: false });
                }
            })
            .on('error', (err) => {
                console.error('[!] Subscription error:', err.message);
            })
            .on('invalid_content', (err, message, ackOrNack) => {
                console.error('[!] Invalid message content:', err.message);
                // Nack without requeue on invalid content
                ackOrNack(err, { strategy: 'nack', requeue: false });
            });

        // Handle graceful shutdown
        const cleanup = async () => {
            console.log("\n[*] Shutting down...");
            try {
                await broker.shutdown();
                console.log("[✓] Broker shutdown complete");
                process.exit(0);
            } catch (error) {
                console.error("[!] Error during shutdown:", error.message);
                process.exit(1);
            }
        };

        process.once("SIGINT", cleanup);
        process.once("SIGTERM", cleanup);

    } catch (error) {

        // Log error
        console.error("[!] Fatal error:", error.message);

        // Attempt to shutdown broker if it was created
        if (broker) {
            try {

                // Attempt to shutdown the broker
                await broker.shutdown();
            } catch (shutdownError) {

                // Log shutdown error
                console.error("[!] Shutdown error:", shutdownError.message);
            }
        }

        // Exit process with error code
        process.exit(1);
    }
};

// Start the receiver
startReceiver();
