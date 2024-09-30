import Config, { ConfigInterface } from '@config'
const config: ConfigInterface = Config()

export const Messages = {
	GeneralError: {
		InsufficientBalance: 'Insufficient Balance',
		Unauthorized: 'Unauthorized',
		SomethingWentWrong: 'Something went wrong.',
		BadRequest: 'Bad Request',
		AccountBlockedByAdmin: `Your account has been deactivated by the administrator, for more updates kindly contact ${config.SUPPORT_EMAIL}.`,
	},
	Helpers: {
		OTPHelper: {
			CodeSentSuccessFullyOverEmail:
				'This is your One Time Password: {{OTP}} from {{BrandName}}',
		},
		VerifyLinkHelper: {
			ForgotPasswordSMS: 'Link {{verifyLink}} from {{BrandName}}',
		},
		JWTHelper: {
			TokenExpired: 'Token Expired! Please signin again.',
		},
	},

	Auth: {
		Success: {
			SignupSuccessful: 'Account created successfully.',
		},
		Error: {
			InvalidCredentials: 'Invalid credentials.',
			UserNotFound: 'User not found.',
		},
	},
	Tracker: {
		Success: {
			Created: 'Reported created successfully.',
		},
	},
}
