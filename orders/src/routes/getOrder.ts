import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth } from '@ticketing.org/common'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'

const router = express.Router()

router.get('/api/orders/:orderId', 
requireAuth,
async (req: Request, res: Response) => {
    const orderId = req.params.orderId
    const foundOrder = await Order.findById(orderId).populate('ticket')

    if (!foundOrder){
        throw new NotFoundError()
    }

    if (foundOrder.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }

    res.send(foundOrder)
})

export { router as getOrderRouter }