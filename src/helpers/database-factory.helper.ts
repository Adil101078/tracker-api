import { Model } from 'mongoose'

interface AggregationFilter {
	startDate: string
	endDate: string
}

export type _GeneratePaginationQuery = {
	_startIndex: number
	_itemsPerPage: number
	query: any[]
	sortObj?: Record<string, any>
	projection?: Record<string, any>
}

class DatabaseService {
	async PerformQuery(model: Model<any>, query: any[]) {
		try {
			const data = await model.aggregate(query)
			return data
		} catch (error) {
			console.error('Error performing query:', error)
			throw error
		}
	}

	GenerateSearchQuery(fieldArray: string[], searchValue: string) {
		return {
			$match: {
				$or: fieldArray.map((field) => ({
					[field]: { $regex: searchValue, $options: 'i' },
				})),
			},
		}
	}

	GenerateDateFilter(queries: AggregationFilter, fieldName: string) {
		return {
			$match: {
				[fieldName]: {
					$gte: new Date(queries.startDate),
					$lte: new Date(queries.endDate),
				},
			},
		}
	}

	GenerateMatchQuery(matchCondition: Record<string, unknown>) {
		return {
			$match: matchCondition,
		}
	}

	GenerateGroupQuery(dataObj: Record<string, any>) {
		return {
			$group: dataObj,
		}
	}

	GenerateProjectionQuery(dataObj: Record<string, any>) {
		return {
			$project: dataObj,
		}
	}

	GenerateSortQuery(dataObj: Record<string, any>) {
		return {
			$sort: dataObj,
		}
	}

	GenerateLimitQuery(limit: number) {
		return {
			$limit: limit,
		}
	}

	async GeneratePaginationQuery(inputs: _GeneratePaginationQuery, model: Model<any>) {
		const perPage = inputs._itemsPerPage > 0 ? inputs._itemsPerPage : 10
		const skipCount: number = inputs._startIndex > 0 ? (inputs._startIndex - 1) * perPage : 0

		const facetObj = {
			$facet: {
				list: [
					{ $sort: inputs.sortObj || { _id: -1 } },
					{ $skip: skipCount },
					{ $limit: perPage },
					{ $project: inputs.projection },
				],
				totalItems: [{ $count: 'count' }],
			},
		}

		const query = inputs.query
		query.push(facetObj)
		console.log(JSON.stringify(query))

		try {
			const data = await model.aggregate(query)
			const totalItems = data[0]?.totalItems[0]?.count || 0
			return {
				totalItems,
				startIndex: inputs._startIndex || 1,
				itemsPerPage: perPage,
				totalPage: Math.ceil(totalItems / perPage),
				data: data[0]?.list || [],
			}
		} catch (error) {
			console.error('Error in GeneratePaginationQuery:', error)
			throw error
		}
	}

	async generateDatatablesResponse(inputs: any, model: Model<any>) {
		try {
			const perPage =
				inputs.itemsPerPage > 0
					? inputs.itemsPerPage
					: parseInt(process.env.ITEMS_PER_PAGE || '10')
			const skipCount = inputs.startIndex > 0 ? (inputs.startIndex - 1) * perPage : 0

			const facetObj = {
				$facet: {
					list: [
						{ $sort: inputs.sortObj || { _id: -1 } },
						{ $skip: skipCount },
						{ $limit: perPage },
						{ $project: { createdAt: 1, ...inputs.projection } },
					],
					totalItems: [{ $count: 'count' }],
				},
			}

			const query = inputs.query
			query.unshift(facetObj)
			const data = await model.aggregate(query).allowDiskUse(true)
			const totalItems = data[0]?.totalItems[0]?.count || 0

			return {
				draw: inputs.startIndex || 1,
				recordsTotal: totalItems,
				recordsFiltered: totalItems,
				data: data[0]?.list || [],
			}
		} catch (error) {
			console.error('Error generating DataTables response:', error)
			throw new Error('DataTables query failed')
		}
	}

	GenerateLookupQuery(
		from: string,
		localField: string,
		foreignField: string,
		asString: string,
		pipeline: any[] = [],
		preserveNullAndEmptyArrays = true
	) {
		return [
			{
				$lookup: {
					from,
					let: { localFieldVar: `$${localField}` },
					pipeline: [
						{
							$match: {
								$expr: { $eq: [`$${foreignField}`, `$$localFieldVar`] },
							},
						},
						...pipeline,
					],
					as: asString,
				},
			},
			{
				$unwind: {
					path: `$${asString}`,
					preserveNullAndEmptyArrays,
				},
			},
		]
	}
}

export const DatebaseServiceHelper = new DatabaseService()
