import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session"

import { errorHandler, NotFoundError, currentUser } from "@ticketing.org/common";
import { createOrderRouter } from './routes/createOrder'
import { deleteOrderRouter } from './routes/deleteOrder'
import { getUsersOrdersRouter } from './routes/getUsersOrders'
import { getOrderRouter } from './routes/getOrder'

const app = express();
// for express to recognize that traffic from nginx ingress is secure
app.set('trust proxy', true)
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
)

app.use(currentUser)

app.use(createOrderRouter)
app.use(deleteOrderRouter)
app.use(getUsersOrdersRouter)
app.use(getOrderRouter)

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }