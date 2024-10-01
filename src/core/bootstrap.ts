import '@core/declarations'
import '@core/globals'
import { Application } from 'app'
import JWTHelper from '@helpers/jwt.helper'
import { MAINTENANCE_MODE_ENUM } from '@models/server-stat'

export default async (app: Application) => {
	// eslint-disable-line
	try {
		await Promise.all([
			CreateServerStateDefaults(),
			JWTHelper.GenerateKeys(), // #2 Generate Public and Private Keys if don't exist
		])
		console.log({
			PORT: process.env.PORT,
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
		})
	} catch (error) {
		Logger.error(error)
	}
}

const CreateServerStateDefaults = async () => {
	const defaultServerStat = [
		{
			name: 'maintenance-mode',
			value: MAINTENANCE_MODE_ENUM.OFF,
		},
	]

	for (const stat of defaultServerStat) {
		const maintenanceModeState = await App.Models.ServerStat.findOne({
			name: stat.name,
		})
			.select('_id')
			.lean()

		if (!maintenanceModeState) {
			await App.Models.ServerStat.create(stat)
		}
	}
}
