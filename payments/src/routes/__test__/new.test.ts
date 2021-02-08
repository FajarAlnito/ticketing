import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@grizzlytickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
it('return 404 when pay an order that doesnt exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdasasd',
			orderId: mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('return 401 when pay an order that doesnt belong to user', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdasasd',
			orderId: order.id,
		})
		.expect(401);
});

it('return 400 when pay an order that cancelled', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Canceled,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			orderId: order.id,
			token: 'asdaskd',
		})
		.expect(400);
});

it('return a 201 with valid inputs', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const price = Math.floor(Math.random() * 100000);
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201);

	const stripeCharges = await stripe.charges.list({ limit: 50 });
	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price;
	});

	console.log(stripeCharge!.amount);
	expect(stripeCharge).toBeDefined();
	expect(stripeCharge!.currency).toEqual('jpy');

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	});

	expect(payment).not.toBeNull();
});
