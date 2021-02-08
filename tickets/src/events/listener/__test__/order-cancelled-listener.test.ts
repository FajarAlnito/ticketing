import { OrderCancelledEvent, OrderStatus } from '@grizzlytickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	//create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);
	//creat and save a ticket
	const orderId = mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: 'asdf',
	});
	ticket.set({ orderId });
	await ticket.save();

	//create the fake data
	const data: OrderCancelledEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 1,
		ticket: {
			id: ticket.id,
		},
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg, orderId };
};

it('update, publish, and ack the message', async () => {
	const { listener, ticket, data, msg, orderId } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);
	expect(updatedTicket!.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalled();
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
