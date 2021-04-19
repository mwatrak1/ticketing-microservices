import { Publisher, Subjects, ExpirationCompleteEvent } from '@ticketing.org/common'
import { Message } from 'node-nats-streaming'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}