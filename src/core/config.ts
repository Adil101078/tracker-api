import '@core/declarations'
import { FileExistsSync } from './utils'

export interface ConfigInterface {
	HOST: string
	PORT: number
	ENVIRONMENT: string
	DB_CONNECTION_STRING: string
	DB_CONNECTION_OPTIONS: any

	ITEMS_PER_PAGE: number

	SALT_ROUNDS: number
	JWT_SECRET: string
	JWT_EXPIRY: string
	SUPPORT_EMAIL: string
	NODE_MAILER: {
		HOST: string
		EMAIL: string
		PASS: string
		PORT: number
		SENDER: string
		RECEIVER: string
	}
  THRESHOLD_PERCENTAGE?: number
  SECONDARY_DB?: string
}

export default (): ConfigInterface => {
	const { NODE_ENV = 'development' } = process.env
	const environment = NODE_ENV?.toLowerCase()
	const environmentFileLocation = `${__dirname}/../environments`
	const environmentFilePath = `${environmentFileLocation}/${environment}`
	if (FileExistsSync(environmentFilePath)) {
		// eslint-disable-next-line
		const configuration: ConfigInterface = require(environmentFilePath).default()
		return configuration
	} else {
		Logger.error(`Missing environment file for NODE_ENV=${environment}.`)
		throw Error(`Missing environment file for NODE_ENV=${environment}.`)
	}
}
