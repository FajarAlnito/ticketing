import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

const ticketId = mongoose.Types.ObjectId().toHexString();
it('marks an order as canceled', async () => {
	const ticket = Ticket.build({
		id: ticketId,
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send();
	expect(204);

	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder.status).toEqual(OrderStatus.Canceled);
});

it('emits an event', async () => {
	const ticket = Ticket.build({
		id: ticketId,
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send();
	expect(204);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
