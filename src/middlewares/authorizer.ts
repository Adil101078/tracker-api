import '@core/declarations'
import { Request, Response, NextFunction } from 'express'
import JWTHelper from '@helpers/jwt.helper'

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.headers.authorization) {
			return res.unauthorized()
		}
		const token = req.headers.authorization.split(' ')[1]

		const response = await JWTHelper.GetUser({ token })

		if (!response) {
			return res.unauthorized()
		}

		if (response.error) {
			return res.unauthorized({
				message: response.error.message,
			})
		}

		const { user, sessionIdentifier } = response

		// Check if user exists
		if (!user) {
			return res.unauthorized()
		}

		req.user = user
		res._user = user._id.toString()
		return next()
	} catch (error) {
		Logger.error(error)
		return res.internalServerError({ error })
	}
}
