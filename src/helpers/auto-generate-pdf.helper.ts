import { Parser } from 'json2csv'
import fs from 'fs'
import { MailHelper } from './mail.helper'
import { template } from '../templates/report'

export class ReportService {
	private static readonly timeDiff = 86000

	public static async GeneratePDF(): Promise<any> {
		const data = await App.Models.Tracker.aggregate([
			{
				$group: {
					_id: {
						date: {
							$dateToString: {
								date: '$createdAt',
								format: '%d-%m-%Y',
							},
						},
						companyCode: '$companyCode',
					},
					count: {
						$sum: 1,
					},
				},
			},
			{
				$sort: {
					'_id.date': -1,
					count: -1,
				},
			},
			{
				$project: {
					_id: 0,
					Company_Code: '$_id.companyCode',
					Hits: '$count',
					'Hits/sec': { $divide: ['$count', ReportService.timeDiff] },
					Date: '$_id.date',
				},
			},
		])

		if (data.length > 0) {
			try {
				const fields = Object.keys(data[0])
				const parser = new Parser({ fields })
				const csv = parser.parse(data)

				// Save the CSV file
				await fs.promises.writeFile('data.csv', csv)

				// Read and send the file as an attachment
				const attachment = fs.readFileSync('data.csv')
				await MailHelper.Send({
					to: App.Config.NODE_MAILER.RECEIVER,
					template: template(),
					subject: 'API Hits Report',
					attachments: [
						{
							filename: 'Report.csv',
							content: attachment,
						},
					],
				})

				Logger.info('File saved and email sent!')
			} catch (err) {
				Logger.error(`Error generating report: ${err.message}`)
				throw err
			}
		}
		return data
	}
}
