import mongoose from "mongoose";
import { app } from './app'

const start = async () => {
  console.log('Starting up auth service....')
  if (!process.env.JWT_KEY){
    throw new Error("No JWT secret enviroment variable defined")
  }

  if (!process.env.MONGO_URI){
    throw new Error("NO MONGO_URI secret environment variable defined")
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    
    console.log("DB running");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!");
  });
};

start();
