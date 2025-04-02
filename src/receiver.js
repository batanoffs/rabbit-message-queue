import amqp from "amqplib";

import { RABBITMQ_CONFIG } from "./common/config.js";

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
 * Processes a received message
 * @param {amqp.ConsumeMessage | null} message - The received message
 */

const processMessage = (message) => {
    if (!message) {
        console.warn("[!] Received null message");
        return;
    }

    try {
        const content = JSON.parse(message.content.toString());
        validateMessage(content);
        console.log("[x] Received message:", content);
    } catch (error) {
        console.error("[!] Error processing message:", error.message);
    }
};

/**
 * Sets up and starts the message receiver
 * @returns {Promise<void>}
 */

const startReceiver = async () => {
    let connection;
    let channel;

    try {
        // Connect to RabbitMQ
        connection = await amqp.connect(RABBITMQ_CONFIG.url);
        channel = await connection.createChannel();

        // Setup queue
        await channel.assertQueue(RABBITMQ_CONFIG.queue, RABBITMQ_CONFIG.options);
        
        // Setup message consumer
        await channel.consume(RABBITMQ_CONFIG.queue, processMessage, RABBITMQ_CONFIG.consumer);

        console.log("[*] Waiting for messages. To exit press CTRL+C");

        // Handle graceful shutdown
        const cleanup = async () => {
            console.log("\n[*] Shutting down...");
            if (channel) {
                await channel.close();
                console.log("[x] Channel closed");
            }
            if (connection) {
                await connection.close();
                console.log("[x] Connection closed");
            }
            process.exit(0);
        };

        process.once("SIGINT", cleanup);
        process.once("SIGTERM", cleanup);

    } catch (error) {
        console.error("[!] Error:", error.message);
        if (channel) await channel.close();
        if (connection) await connection.close();
        process.exit(1);
    }
};

// Start the receiver
startReceiver().catch(error => {
    console.error("[!] Fatal error:", error.message);
    process.exit(1);
});
