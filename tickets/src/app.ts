import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session"

import { errorHandler, NotFoundError, currentUser } from "@ticketing.org/common";
import { createTicketRouter } from './routes/createTicket'
import { getTicketByIdRouter } from './routes/getTicketById'
import { getAllTicketsRouter } from './routes/getAllTickets'
import { updateTicketRouter } from './routes/updateTicket'

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
app.use(createTicketRouter)
app.use(getTicketByIdRouter)
app.use(getAllTicketsRouter)
app.use(updateTicketRouter)

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }