import { Publisher, TicketCreatedEvent, Subjects } from '@ticketing.org/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}

