import '@core/declarations'
import { DatebaseServiceHelper } from '@helpers/database-factory.helper'
import DatatableResponseGenerator from '@helpers/datatable-response-generator.helper'
import { Request, Response } from 'express'
import moment from 'moment'


export default async function GetAll(req: Request, res: Response) {
	const { companyCode, startDate } = req.query
	const query = [
		DatebaseServiceHelper.GenerateMatchQuery({
			companyCode,
			createdAt: {
				$gte: (moment(startDate.toString()).startOf('day')).toDate(),
				$lte: moment(startDate.toString()).endOf('day').toDate(),
			},
		}),
	]

	const response = await DatatableResponseGenerator({
		model: App.Models.Tracker,
		matchObj: {},
		projection: {
			companyCode: 1,
			credentialCode: 1,
			referralUrl: 1,
			IP: 1,
			searchId: 1,
			origin: 1,
			destination: 1,
			adults: 1,
			child: 1,
			infants: 1,
			createdAt: 1,
			classOfService: 1,
			currency: 1,
		},
		reqQuery: req.query,
		searchField: [],
		extraQuery: query,
	})

	return res.send(response)
}
