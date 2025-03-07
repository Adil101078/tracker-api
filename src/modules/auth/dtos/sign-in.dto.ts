import Joi from 'joi'

export const SignInDTO = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
})
