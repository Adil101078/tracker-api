import '@core/declarations'
import requestValidator from '@helpers/request-validator.helper'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import authAfterEffectsHelper from '@helpers/auth-after-effects.helper'
import { SignInDTO } from '../dtos/sign-in.dto'

export default async function SignIn(req: Request, res: Response) {
	const errors = await requestValidator(SignInDTO, req.body)

	if (errors) {
		return res.unprocessableEntity({ errors })
	}

	const { email, password } = req.body

	const existingUser = await App.Models.User.findOne({ email }).select('+password').lean()

	if (!existingUser) {
		return res.notFound({ message: App.Messages.Auth.Error.UserNotFound() })
	}

	if (!(await bcrypt.compare(password, existingUser.password))) {
		return res.forbidden({
			message: App.Messages.Auth.Error.InvalidCredentials(),
		})
	}

	const { token } = await authAfterEffectsHelper.GenerateToken({
		_user: existingUser._id.toString(),
	})
	delete existingUser.password
	return res.success({
		items: { token, existingUser },
	})
}
