import '@core/declarations'
import { AuthRouter } from '@modules/auth/routes'
import { Router } from 'express'
import { MeRouter } from './modules/me/routes'
import { ReportRouter } from '@modules/report/routes'

const router = Router()

router.use('/auth', AuthRouter)

router.use('/me', MeRouter)
router.use('/reports', ReportRouter)
export const AppRoutes = router
