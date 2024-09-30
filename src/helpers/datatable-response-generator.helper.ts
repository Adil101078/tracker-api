export default async function DatatableResponseGenerator({
	model,
	matchObj,
	projection,
	reqQuery,
	searchField,
	extraQuery,
}: {
	model: any
	matchObj?: any
	projection?: any
	reqQuery: any
	searchField: Array<string>
	extraQuery?: Array<any>
}) {
	const { order, columns, start, length } = reqQuery
	let { search } = reqQuery
	let orderBy
	const orderByData: any = {}
	const query: any[] = []

	if (order && search) {
		orderBy = columns[order[0].column].data
		orderByData[orderBy] = order[0].dir == 'desc' ? -1 : 1
		search = search.value !== '' ? search.value : false
	}

	const _projection = {
		...projection,
		createdAt: 1,
		updatedAt: 1,
	}

	if (matchObj) query.push({ $match: matchObj })
	if (extraQuery) query.push(...extraQuery)
	if (search) {
		query.push({
			$match: {
				$or: searchField.map((field: string) => ({
					[field]: { $regex: search, $options: 'i' },
				})),
			},
		})
	}
	// Optimize sorting, skipping, and limiting by combining into a $facet stage
	query.push({
		$facet: {
			paginatedData: [
				{ $sort: Object.keys(orderByData).length !== 0 ? orderByData : { createdAt: -1 } },
				{ $skip: Number(start) || 0 },
				{ $limit: Number(length) || 100 },
				{ $project: _projection },
			],
			totalRecords: [{ $count: 'count' }],
		},
	})

	const [response] = await model.aggregate(query).exec()

	const totalRecords = response.totalRecords[0]?.count || 0

	const responseData = {
		draw: reqQuery?.draw,
		recordsTotal: totalRecords,
		recordsFiltered: totalRecords,
		data: response.paginatedData || [],
	}

	return responseData
}
