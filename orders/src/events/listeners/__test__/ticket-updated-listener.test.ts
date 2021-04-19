import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'


const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    await ticket.save()

    const event = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'movie',
        price: 200,
        userId: mongoose.Types.ObjectId().toHexString()
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, event, msg, ticket }
}

it('finds and updates a ticket', async () => {
    const { listener, event, msg, ticket } = await setup()
    
    await listener.onMessage(event, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(event.title)
    expect(updatedTicket!.price).toEqual(event.price)
    expect(updatedTicket!.version).toEqual(event.version)

})

it('acks the message', async () => {
    const { listener, event, msg } = await setup()

    await listener.onMessage(event, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('does not ackn the event when events are out of order', async () => {
    const { listener, event, msg, ticket } = await setup()

    event.version += 1
    
    try {
        await listener.onMessage(event, msg)
    }
    catch (err) {

    }
    

    expect(msg.ack).not.toHaveBeenCalled()
})