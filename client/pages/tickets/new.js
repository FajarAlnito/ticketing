import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

export default function NewTicket() {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');
	const { doRequest, errors } = useRequest({
		url: '/api/tickets',
		method: 'post',
		body: {
			title,
			price,
		},
		onSuccess: (ticket) => Router.push('/'),
	});

	const onSubmit = (e) => {
		e.preventDefault();

		doRequest();
	};
	const onBlur = () => {
		const value = parseInt(price);
		if (isNaN(value)) {
			return;
		}
		setPrice(value.toFixed(0));
	};

	return (
		<div>
			<h1>Create New Ticket</h1>
			<form onSubmit={onSubmit}>
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input
						className="form-control"
						type="text"
						name="title"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="price">Price</label>
					<input
						className="form-control"
						type="number"
						name="price"
						id="price"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						onBlur={onBlur}
					/>
				</div>
				{errors}
				<button className="btn btn-primary">Submit</button>
			</form>
		</div>
	);
}
