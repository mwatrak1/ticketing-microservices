import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async () => {
  console.log("Starting expiration service...")
  if (!process.env.NATS_CLUSTER_ID){
    throw new Error("No NATS_CLUSTER_ID environment variable defined")
  }

  if (!process.env.NATS_CLIENT_ID){
    throw new Error("No NATS_CLIENT_ID environment variable defined")
  }

  if (!process.env.NATS_URL){
    throw new Error("No NATS_URL environment variable defined")
  }

  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID, 
    process.env.NATS_CLIENT_ID, 
    process.env.NATS_URL)

  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed')
    process.exit()
  })

  process.on('SIGINT', () => natsWrapper.client.close())
  process.on('SIGTERM', () => natsWrapper.client.close())

  new OrderCreatedListener(natsWrapper.client).listen()
};

start();
