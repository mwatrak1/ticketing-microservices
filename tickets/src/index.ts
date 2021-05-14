import mongoose from "mongoose";
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'


const start = async () => {
  console.log("Starting tickets service...")
  if (!process.env.JWT_KEY){
    throw new Error("No JWT secret enviroment variable defined")
  }

  if (!process.env.MONGO_URI){
    throw new Error("No MONGO_URI environment variable defined")
  }

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

  new OrderCreatedListener(natsWrapper.client).listen()
  new OrderCancelledListener(natsWrapper.client).listen()

  process.on('SIGINT', () => natsWrapper.client.close())
  process.on('SIGTERM', () => natsWrapper.client.close())

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  
  console.log("DB running");

  

  app.listen(3000, () => {
    console.log("Listening on port 3000!");
  });
};

start();
