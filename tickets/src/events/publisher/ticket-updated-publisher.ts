import {
	Publisher,
	Subjects,
	TicketUpdatedEvent,
} from '@grizzlytickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
