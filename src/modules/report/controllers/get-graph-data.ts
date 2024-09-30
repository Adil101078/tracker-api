import '@core/declarations'
import { DatebaseServiceHelper } from '@helpers/database-factory.helper'
import { Request, Response } from 'express'
import moment from 'moment'

export default async function GetGraphData(req: Request, res: Response) {
	const { companyCode, startDate, groupBy = '$destination' } = req.query

	const query = [
		DatebaseServiceHelper.GenerateMatchQuery({
			companyCode,
			createdAt: {
				$gte: moment(startDate.toString()).startOf('day').toDate(),
				$lte: moment(startDate.toString()).endOf('day').toDate(),
			},
		}),
		DatebaseServiceHelper.GenerateGroupQuery({
			_id: groupBy,
			totalHits: {
				$count: {},
			},
		}),
        DatebaseServiceHelper.GenerateSortQuery({totalHits:-1}),
        DatebaseServiceHelper.GenerateLimitQuery(35),
		DatebaseServiceHelper.GenerateGroupQuery({
			_id: null,
			data: { $push: { x: '$_id', y: '$totalHits' } },
		}),
		DatebaseServiceHelper.GenerateProjectionQuery({
			name: 'Destinations',
			data: 1,
			_id: 0,
		}),
	]
	const items = await DatebaseServiceHelper.PerformQuery(App.Models.Tracker, query)
	return res.success({ items })
}
