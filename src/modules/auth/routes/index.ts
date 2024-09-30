import '@core/declarations'
import { Wrap } from '@core/utils'
import { Router } from 'express'
import AuthController from '../controllers'

const router = Router()
const controller = new AuthController()

router.post('/sign-in', Wrap(controller.SignIn))

export const AuthRouter = router
