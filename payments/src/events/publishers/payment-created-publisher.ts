import { PaymentCreatedEvent, Publisher, Subjects } from "@ticketing.org/common";

export class PaymentCreatedPubisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}