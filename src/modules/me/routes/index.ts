import '@core/declarations'
import { Wrap } from '@core/utils'
import { Router } from 'express'
import MeController from '../controllers'
import { authorize } from '@middlewares/authorizer'

const router = Router()

router.use(authorize)
const controller = new MeController()
router.get('/', Wrap(controller.Get))

export const MeRouter = router
