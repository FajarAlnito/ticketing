import mongoose from 'mongoose';
import express, { Request, response, Response } from 'express';
import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@grizzlytickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECOND = 1 * 60;
router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		//find the ticket the user is trying to order in the database
		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			throw new NotFoundError();
		}

		//make sure the ticket is not already reserved
		const isReserved = await ticket.isReserved();
		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}
		//calculate an expiration date for this order
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECOND);
		//build the order and save it to the databse
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		});

		await order.save();

		// publish an event saying that an order was created
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			version: order.version,
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});
		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
