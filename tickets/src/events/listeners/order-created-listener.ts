import { Listener, OrderCreatedEvent, Subjects } from '@ticketing.org/common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { natsWrapper } from '../../nats-wrapper'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName
    
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const reservedTicket = await Ticket.findById(data.ticket.id)

        if (!reservedTicket) {
            throw new Error('Ticket not found')
        }

        reservedTicket.set({
            orderId: data.id
        })

        await reservedTicket.save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: reservedTicket.id,
            price: reservedTicket.price,
            title: reservedTicket.title,
            userId: reservedTicket.userId,
            orderId: reservedTicket.orderId,
            version: reservedTicket.version
        })

        msg.ack()
    }
}