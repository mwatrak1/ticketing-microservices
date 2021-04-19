import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { OrderStatus } from '@ticketing.org/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const orderId = mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'sfjmwo02'
    })

    ticket.set({ orderId })
    await ticket.save()

    const event = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, event, msg, orderId }
}

it('updates the ticket publishes an event and acks the message', async () => {
    const { listener, ticket, event, msg, orderId } = await setup()

    await listener.onMessage(event, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket?.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})