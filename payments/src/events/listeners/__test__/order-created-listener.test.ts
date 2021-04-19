import { OrderStatus } from "@ticketing.org/common"
import { Message } from "node-nats-streaming"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import mongoose from 'mongoose'
import { Order } from "../../../models/order"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)

    const event = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'dnwdoodw',
        ticket: {
            id: 'fnmfow',
            price: 20
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, event, msg }
}

it('saves an order to the db', async () => {
    const { listener, event, msg } = await setup()

    await listener.onMessage(event, msg)

    const foundOrder = await Order.findById(event.id)

    expect(foundOrder?.id).toEqual(event.id)
    expect(foundOrder?.status).toEqual(event.status)
    expect(foundOrder?.userId).toEqual(event.userId)
    expect(foundOrder?.version).toEqual(event.version)
})

it('acks the message', async () => {
    const { listener, event, msg } = await setup()

    await listener.onMessage(event, msg)

    expect(msg.ack).toHaveBeenCalled()
})