import { Publisher, OrderCreatedEvent, Subjects } from '@grizzlytickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
