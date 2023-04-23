import { MAIL_PASSWORD } from '$env/static/private';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: { user: 'ohgsecondhand@gmail.com', pass: MAIL_PASSWORD }
});

export default function sendMail({ email, subject, text }: { email: string; subject: string; text: string }) {
	return new Promise<'error' | 'success'>((resolve) => {
		transport.sendMail({ from: 'OHG Second Hand <ohgsecondhand@gmail.com>', to: email, subject, text }, (error) =>
			resolve(error ? 'error' : 'success')
		);
	});
}
