import '@core/declarations'
import { Request, Response } from 'express'

export default async function Create(req: Request, res: Response) {
	const payload = _.omitBy({ ...req.body }, _.isNil)

	const newItem = new App.Models.Tracker(payload)

	await newItem.save()

	return res.success({
		message: App.Messages.Tracker.Success.Created(),
	})
}
