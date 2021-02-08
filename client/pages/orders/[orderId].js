import { Router } from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';

export default function OrderShow({ order, currentUser }) {
	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push('/orders'),
	});
	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};
		findTimeLeft();
		let timeInterval = setInterval(findTimeLeft, 1000);

		return () => {
			clearInterval(timeInterval);
		};
	}, [order]);

	if (timeLeft < 0) {
		return <div>ORDER EXPIRED</div>;
	}
	return (
		<div>
			Time to left to pay: {timeLeft}
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_51II8a5FuAtexkz64ugtEHAgHg0H4lSHoS89zHZuioejz8BDjSSzez2aYua5W0rLBcx0qHQXbclgZIXep3aaf2yQS00WulVuGBx"
				amount={order.ticket.price}
				email={currentUser.email}
			/>
			{errors}
		</div>
	);
}

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);
	return { order: data };
};
