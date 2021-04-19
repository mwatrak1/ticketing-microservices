import { OrderCancelledEvent, OrderStatus } from "@ticketing.org/common"
import { Message } from "node-nats-streaming"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from 'mongoose'
import { Order } from "../../../models/order"

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    const orderId = mongoose.Types.ObjectId().toHexString()

    const order = Order.build({
        id: orderId,
        status: OrderStatus.Created,
        userId: 'fmaj9768',
        version: 0,
        price: 20
    })
    await order.save()

    const event: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString()
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, event, msg, order }
}

it('updates orders status to cancelled', async () => {
    const { listener, event, msg, order } = await setup()

    await listener.onMessage(event, msg)

    const cancelledOrder = await Order.findById(order.id)

    expect(cancelledOrder).toBeDefined()
    expect(cancelledOrder?.status).toEqual(OrderStatus.CancelledByPayment)
    
})

it('updates orders version', async () => {
    const { listener, event, msg, order } = await setup()

    await listener.onMessage(event, msg)

    const cancelledOrder = await Order.findById(order.id)

    expect(cancelledOrder).toBeDefined()
    expect(cancelledOrder?.version).toEqual(1)
    
})

it('acks the message', async () => {
    const { listener, event, msg } = await setup()

    await listener.onMessage(event, msg)

    expect(msg.ack).toHaveBeenCalled()
})