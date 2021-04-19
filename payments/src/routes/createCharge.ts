import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@ticketing.org/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPubisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post('/api/payments',
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty()
      .withMessage('Reqeust must contain an authorization token'),
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Valid orderId must be privided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order){
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id){
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.CancelledByPayment || order.status === OrderStatus.CancelledByUser){
      throw new BadRequestError('Order has already been cancelled')
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: token
    })

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    })
    await payment.save()

    await new PaymentCreatedPubisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    })

    res.status(201).send({ id: payment.id })
})

export { router as createChargeRouter }