import amqp from "amqplib";

/**
 * RabbitMQ Configuration
 * @constant {Object}
 */
const RABBITMQ_CONFIG = {
    url: "amqp://localhost",
    queue: "product_inventory",
    options: { durable: false }
};

/**
 * Sample message for inventory check
 * @constant {Object}
 */
const SAMPLE_MESSAGE = {
    item_id: "macbook",
    text: "This is a sample message to send receiver to check the ordered Item Availability",
};

/**
 * Validates the message structure
 * @param {Object} message - Message to validate
 * @returns {boolean} - True if valid, throws error if invalid
 * @throws {Error} If message structure is invalid
 */
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
 * Sends a message to RabbitMQ queue
 * @param {Object} message - Message to send
 * @returns {Promise<void>}
 */
const sendMessage = async (message) => {
    let connection;
    try {
        // Validate message before attempting to send
        validateMessage(message);

        // Connect to RabbitMQ
        connection = await amqp.connect(RABBITMQ_CONFIG.url);
        const channel = await connection.createChannel();

        // Assert queue and send message
        await channel.assertQueue(RABBITMQ_CONFIG.queue, RABBITMQ_CONFIG.options);
        channel.sendToQueue(
            RABBITMQ_CONFIG.queue, 
            Buffer.from(JSON.stringify(message))
        );

        console.log("[x] Message sent successfully:", message);
        await channel.close();
    } catch (error) {
        console.error("[!] Error sending message:", error.message);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("[x] Connection closed");
            } catch (error) {
                console.error("[!] Error closing connection:", error.message);
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
