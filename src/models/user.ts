import '@core/declarations'
import { Models } from '@core/constants/database-models'
import { Role } from '@core/constants/roles'
import { model, Schema } from 'mongoose'

interface IAdmin {
	fullName: string
	email: string
	password: string
	accountType: Role
}

const schema = new Schema<IAdmin>(
	{
		fullName: String,
		email: { type: String, lowercase: true },
		password: { type: String, select: false },
		accountType: {
			type: String,
			enum: [Role.ADMIN, Role.SUPER_ADMIN, Role.USER],
			default: Role.USER,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

export const UserModel = model<IAdmin>(Models.User, schema)
