import { ConfigInterface } from '@config'

const APP_PORT: number = parseInt(process.env.PORT)
const DOMAIN_NAME: string = process.env.DOMAIN_NAME ?? 'localhost'
const HTTP_PROTOCOL: string = process.env.HTTP_PROTOCOL ?? 'http'

export default (): ConfigInterface => {
	process.env['NODE_ENV'] = 'development'

	return {
		HOST:
			process.env.HOST ??
			`${HTTP_PROTOCOL}://${DOMAIN_NAME}${APP_PORT == 80 ? '' : `:${APP_PORT}`}`,
		PORT: APP_PORT,
		ENVIRONMENT: process.env['NODE_ENV'],
		DB_CONNECTION_STRING: process.env.DEV_DB_CONNECTION_STRING,
		DB_CONNECTION_OPTIONS: {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},

		ITEMS_PER_PAGE: parseInt(process.env.ITEMS_PER_PAGE),
		SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
		JWT_SECRET: process.env.JWT_SECRET,
		JWT_EXPIRY: process.env.JWT_EXPIRY,

		SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,

		NODE_MAILER: {
			HOST: process.env.NODE_MAILER_HOST,
			EMAIL: process.env.NODE_MAILER_EMAIL,
			PASS: process.env.NODE_MAILER_PASS,
			PORT: parseInt(process.env.NODE_MAILER_PORT),
			SENDER: process.env.NODE_MAILER_SENDER,
			RECEIVER: process.env.NODE_MAILER_RECEIVER,
		},
		THRESHOLD_PERCENTAGE: parseInt(process.env.THRESHOLD_PERCENTAGE),
		SECONDARY_DB: process.env.SECONDARY_DB,
	}
}
