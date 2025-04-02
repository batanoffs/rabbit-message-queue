This is practice project for Message Que

## Notes:

AMQP has the following components:

- **Producer** is an application that sends messages.
- **Consumer** is an application that receives messages.
- **Queue** is a buffer that stores the messages.
- **Message** is the information that is sent from the producer to a consumer.
- **Exchange** receives messages from producers and pushes them to queues depending on rules defined by the exchange type. The exchange type determines how messages are routed.
- **Binding** links the queue to the exchange.