import { MongoClient } from 'mongodb'
import { ReportService } from './auto-generate-pdf.helper'

interface DataObj {
	search: { value: string }
	start: number
	length: number
	companyCode?: string
	startDate?: string
	endDate?: string
	columns: Array<{ data: string }>
	order: Array<{ column: number; dir: string }>
	draw: number
}

class DatabaseCleaner {
	private readonly THRESHOLD_PERCENTAGE: number
	private readonly URL: string
	private readonly COLLECTION_NAME = 'reports'

	constructor() {
		this.URL = App.Config.SECONDARY_DB
		this.THRESHOLD_PERCENTAGE = App.Config.THRESHOLD_PERCENTAGE
	}

	private async connectToMongo(): Promise<MongoClient> {
		const client = new MongoClient(this.URL)
		try {
			await client.connect()
			Logger.info('Secondary Database Connected Successfully.')
			return client
		} catch (error) {
			Logger.error(`Error Connecting to Secondary Database: ${error.message}`)
			throw error
		}
	}

	public async monitorAndCleanup(): Promise<void> {
		try {
			const stats = await App.Models.Tracker.collection.stats({ scale: 1024 })
			const dataSize = stats.size
			const storageUsed = Math.round((dataSize / 460800) * 100)

			Logger.warn(`Storage Usage: ${storageUsed}%`)
			Logger.warn(`Used: ${(dataSize / 1024).toFixed(2)}MB`)

			if (storageUsed >= this.THRESHOLD_PERCENTAGE) {
				Logger.info('Database storage is full | Performing Delete operation')
			}
			await this.moveDatabaseDocuments()
		} catch (error) {
			Logger.error(`Error in monitorAndCleanup: ${error}`)
		}
	}

	private async moveDatabaseDocuments(): Promise<void> {
		const client = await this.connectToMongo()
		try {
			const db = client.db()
			const data = await ReportService.GeneratePDF()

			if (data.length > 0) {
				const result = await db.collection(this.COLLECTION_NAME).insertMany(data)

				if (result) {
					// await App.Models.Tracker.deleteMany()
					Logger.info('Old Tracker data moved and deleted successfully.')
				}
			}
		} catch (error) {
			Logger.error(`Error moving database documents: ${error}`)
		} finally {
			await client.close()
		}
	}

	public async fetchArchivedData(dataObj: DataObj): Promise<any> {
		const client = await this.connectToMongo()
		try {
			const { search, start, length, companyCode, startDate, endDate, columns, order, draw } =
				dataObj
			const orderBy = columns[order[0].column].data
			const orderByData: { [key: string]: number } = {}
			orderByData[orderBy] = order[0].dir === 'asc' ? 1 : -1
			const searchTerm = search.value || false

			const db = client.db()
			const collection = db.collection(this.COLLECTION_NAME)

			const query: any[] = []

			if (startDate && endDate) {
				query.push({
					$match: {
						$or: [{ Date: startDate }, { Date: endDate }],
					},
				})
			}

			if (companyCode) {
				query.push({
					$match: { Company_Code: companyCode },
				})
			}

			query.push(
				{
					$group: {
						_id: {
							date: '$Date',
							companyCode: '$Company_Code',
						},
						'Hits/sec': { $first: '$Hits/sec' },
						Hits: { $first: '$Hits' },
					},
				},
				{
					$project: {
						_id: 0,
						Company_Code: '$_id.companyCode',
						Hits: 1,
						'Hits/sec': 1,
						Date: '$_id.date',
					},
				},
				{ $sort: orderByData },
				{
					$facet: {
						list: [{ $skip: Number(start) || 0 }, { $limit: Number(length) || 10 }],
						totalRecords: [{ $count: 'count' }],
					},
				}
			)

			const response = await collection.aggregate(query).toArray()
			const responseData = {
				draw,
				recordsTotal: response[0]?.totalRecords[0]?.count || 0,
				recordsFiltered: response[0]?.totalRecords[0]?.count || 0,
				data: response[0]?.list || [],
			}

			return responseData
		} catch (error) {
			Logger.error(`Error fetching archived data: ${error}`)
			return null
		} finally {
			await client.close()
		}
	}
}

export const DatabaseHelper = new DatabaseCleaner()
