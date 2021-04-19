import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { OrderStatus } from '@ticketing.org/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'sfjmwo02'
    })
    await ticket.save()

    const event = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'fk202spfsp',
        expiresAt: Date(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, event, msg }
}

it('sets the orderId of the reserved ticket', async () => {
    const { listener, ticket, event, msg } = await setup()

    await listener.onMessage(event, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(event.id)
})

it('acks the messsage', async () => {
    const { listener, ticket, event, msg } = await setup()

    await listener.onMessage(event, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, event, msg } = await setup()

    await listener.onMessage(event, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
    
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(eventData.version).toEqual(updatedTicket?.version)
    expect(event.id).toEqual(eventData.orderId)
})