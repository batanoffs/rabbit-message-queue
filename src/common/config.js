/**
 * RabbitMQ Configuration
 * @constant {Object}
 */

export const RABBITMQ_CONFIG = {
    url: "amqp://localhost",
    queue: "product_inventory",
    options: { durable: false },
    consumer: { noAck: true }
};