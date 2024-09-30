import '@core/declarations'
import { DatebaseServiceHelper } from '@helpers/database-factory.helper'
import { Request, Response } from 'express'

export default async function GetCompanyCodes(req: Request, res: Response) {
	const response = await DatebaseServiceHelper.PerformQuery(App.Models.Tracker, [
		DatebaseServiceHelper.GenerateGroupQuery({ _id: '$companyCode' }),
		DatebaseServiceHelper.GenerateProjectionQuery({ companyCode: '$_id' }),
	])
	return res.success({
		items: response,
	})
}
