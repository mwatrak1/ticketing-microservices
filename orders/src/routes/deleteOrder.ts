import { requireAuth, BadRequestError, NotAuthorizedError, OrderStatus } from '@ticketing.org/common'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete('/api/orders/:orderId',
requireAuth,
async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')

    if (!order){
        throw new BadRequestError('Order with given id does not exist')
    }

    if (order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }

    order.status = OrderStatus.CancelledByUser
    await order.save()

    // emit an event saying order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })

    res.status(204).send(order)
})

export { router as deleteOrderRouter }