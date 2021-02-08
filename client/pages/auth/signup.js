import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

export default function signUp() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { doRequest, errors } = useRequest({
		url: '/api/users/signup',
		method: 'post',
		body: {
			email,
			password,
		},
		onSuccess: () => Router.push('/'),
	});

	const onSubmit = async (e) => {
		e.preventDefault();
		await doRequest();
	};
	return (
		<form onSubmit={onSubmit}>
			<h1>Sign up</h1>
			<div className="form-group">
				<label htmlFor="">Email Address</label>
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					className="form-control"
				/>
			</div>
			<div className="form-group">
				<label htmlFor="password">Password</label>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					className="form-control"
				/>
			</div>
			{errors}
			<button className="btn btn-primary">Sign Up</button>
		</form>
	);
}
