import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from './ticket-updated-event';
import { Subjects } from './subject';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = 'payment-service';

	onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		console.log('Event data!', data);
		msg.ack();
	}
}
