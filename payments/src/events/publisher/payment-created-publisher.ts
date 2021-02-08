import {
	Subjects,
	Publisher,
	PaymentCreatedEvent,
} from '@grizzlytickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
