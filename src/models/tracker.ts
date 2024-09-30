import { Models } from '@core/constants/database-models'
import '@core/declarations'
import { model, Schema } from 'mongoose'

interface ITracker {
	companyCode: string
	credentialCode: string
	secretKey: string
	IP: string
	referralUrl: string
	searchId: string
	origin: string
	destination: string
	classOfService: string
	adults: string
	child: string
	infants: string
	currency: string
}
const schema = new Schema<ITracker>(
	{
		companyCode: {
			type: String,
			required: true,
			index: true,
		},
		credentialCode: String,
		secretKey: String,
		IP: String,
		referralUrl: String,
		searchId: String,
		origin: String,
		destination: String,
		classOfService: String,
		adults: String,
		child: String,
		infants: String,
		currency: String,
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

export const TrackerModel = model<ITracker>(Models.Tracker, schema)
