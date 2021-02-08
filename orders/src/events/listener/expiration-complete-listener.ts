import {
	Listener,
	ExpirationCompleteEvent,
	Subjects,
	OrderStatus,
} from '@grizzlytickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { OrderCancelledPublisher } from '../publisher/order-cancelled-publisher';
import { Order } from '../../models/order';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
	queueGroupName = queueGroupName;

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId).populate('ticket');

		if (!order) {
			throw new Error('Order Not Found');
		}
		if (order.status === OrderStatus.Complete) {
			console.log('order completed dont cancel the order');
			msg.ack();
		} else {
			order.set({ status: OrderStatus.Canceled });

			await order.save();

			await new OrderCancelledPublisher(this.client).publish({
				id: order.id,
				version: order.version,
				ticket: {
					id: order.ticket.id,
				},
			});

			msg.ack();
		}
	}
}
