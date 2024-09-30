import '@core/declarations'
import nodemailer from 'nodemailer'

interface Attachment {
	filename: string
	content: any
}

interface SendEmailOptions {
	to: string
	template: string
	subject: string
	attachments?: Attachment[]
}

class Mail {
	private transporter: nodemailer.Transporter

	constructor() {
		const { HOST, PORT, EMAIL, PASS } = App.Config.NODE_MAILER

		this.transporter = nodemailer.createTransport({
			host: HOST,
			port: PORT,
			secure: true, // Use TLS
			auth: {
				user: EMAIL,
				pass: PASS,
			},
		})
	}

	public async Send({
		to,
		template,
		subject,
		attachments = [],
	}: SendEmailOptions): Promise<void> {
		try {
			const { SENDER } = App.Config.NODE_MAILER

			const mailOptions = {
				from: SENDER,
				to,
				subject,
				html: template,
				attachments,
			}

			const info = await this.transporter.sendMail(mailOptions)

			Logger.info(`Email sent successfully to ${to}. Message ID: ${info.messageId}`)
		} catch (err) {
			Logger.error(`Failed to send email to ${to}: ${JSON.stringify(err)}`)
		}
	}
}

export const MailHelper = new Mail()
