import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../../models/order'
import { Message } from 'node-nats-streaming'
import { OrderCancelledPublisher } from '../../publishers/order-cancelled-publisher'

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        userId: 'fkwp0f0k',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    const data = {
        orderId: order.id
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg}
} 

it('changes order status to cancelled', async () => {
    const { listener, order, ticket, data, msg} = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder?.status).toEqual(OrderStatus.CancelledByPayment)
})

it('emits an order cancelled event', async () => {
    const { listener, order, ticket, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse(
            (natsWrapper.client.publish as jest.Mock).mock.calls[0][1] )

    expect(eventData.id).toEqual(order.id)
})

it('acks the message', async () => {
    const { listener, order, ticket, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})