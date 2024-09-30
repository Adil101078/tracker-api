import '@core/declarations'
import JWTHelper from '@helpers/jwt.helper'

export class AuthAfterEffectsHelper {
	async GenerateToken(payload: { [key: string]: any }) {
		const { _user } = payload

		// Generate a new JWT token
		const token = JWTHelper.GenerateToken({
			_id: _user,
		})

		return { token }
	}
}

// All Done
export default new AuthAfterEffectsHelper()
