/**
 * Rascal broker configuration
 * @constant {Object}
 */

export const BROKER_CONFIG = {
    vhosts: {
        "/": {
            connection: {
                url: "amqp://localhost"
            },
            queues: {
                "product_inventory": {
                    options: {
                        durable: false
                    }
                }
            },
            publications: {
                "inventory_check": {
                    queue: "product_inventory",
                    confirm: true
                }
            },
            subscriptions: {
                "inventory_listener": {
                    queue: "product_inventory",
                    prefetch: 10
                }
            }
        }
    }
};