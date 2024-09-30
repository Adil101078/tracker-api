import '@core/declarations'
import { Request, Response } from 'express'

export default async function Get(req: Request, res: Response) {
	const { user } = req
	return res.success({ items: user })
}
