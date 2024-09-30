import '@core/declarations'
import { DatebaseServiceHelper } from '@helpers/database-factory.helper'
import DatatableResponseGenerator from '@helpers/datatable-response-generator.helper'
import { Request, Response } from 'express'
import moment from 'moment'

export default async function GetAll(req: Request, res: Response) {
	const { companyCode, startDate, endDate } = req.query
	let query = []
	if (companyCode) {
		query.push(DatebaseServiceHelper.GenerateMatchQuery({ companyCode }))
	}
	if (startDate) {
		query.push(
			DatebaseServiceHelper.GenerateMatchQuery({
				createdAt: {
					$gte: moment(startDate.toString()).startOf('day').toDate(),
				},
			})
		)
	}
	if (endDate) {
		query.push(
			DatebaseServiceHelper.GenerateMatchQuery({
				createdAt: {
					$lte: moment(endDate.toString()).endOf('day').toDate(),
				},
			})
		)
	}
	query.push(
		DatebaseServiceHelper.GenerateGroupQuery({
			_id: {
				date: {
					$dateToString: {
						format: '%Y-%m-%d',
						date: '$createdAt',
					},
				},
				companyCode: '$companyCode',
			},
			count: { $sum: 1 },
		}),
		DatebaseServiceHelper.GenerateSortQuery({ '_id.date': -1, count: -1 })
	)

	const response = await DatatableResponseGenerator({
		model: App.Models.Tracker,
		matchObj: {},
		projection: {
			_id: 1,
			count: 1,
		},
		reqQuery: req.query,
		searchField: ['_id.companyCode'],
		extraQuery: query,
	})

	return res.send(response)
}
