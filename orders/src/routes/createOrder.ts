import express, { Request, Response } from 'express'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@ticketing.org/common'
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'
import { isConstructorDeclaration } from 'typescript'

const router = express.Router()

const ORDER_EXPIRATION_SECONDS = 1 * 60

router.post('/api/orders', 
requireAuth,
[
    body('ticketId')
      .not()
      .isEmpty()
      .withMessage('TicketId must be provided')
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Invalid ticketId')
],
validateRequest,
async (req: Request, res: Response) => {
    // find the ticket the user is trying to order in db
    const { ticketId } = req.body
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
        throw new NotFoundError()
    }
    // make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved()

    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    }

    // calculate an expiration date for order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + ORDER_EXPIRATION_SECONDS)

    // build the order and dave to db
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    })
    await order.save()
    // publish an event

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: OrderStatus.Created,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price
        }
    })

    res.status(201).send(order)
})

export { router as createOrderRouter }