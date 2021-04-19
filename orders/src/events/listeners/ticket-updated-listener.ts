import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@ticketing.org/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
    queueGroupName: string = queueGroupName
    
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const { id, title, price, version } = data

        const ticket = await Ticket.findByEvent(data)

        if (!ticket){
            console.log(`Ticket with id ${id} and version ${version} not found`)
            return 
        }

        ticket?.set({ title, price })
        await ticket?.save()

        msg.ack()

    }
}