import {
	Publisher,
	OrderCancelledEvent,
	Subjects,
} from '@grizzlytickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
