// ./src/service/labelService.ts

import { db } from "../lib/db.ts";

export const labelService = {
	getDatasetAndConfigById: async (id: number) => {
		try {
			const result = db.file.findUniqueOrThrow({
				include: {
					labels: true,
					rows: true,
					_count: { select: { rows: true } },
				},
				where: { id },
			});
			return result;
		} catch (error) {
			throw error;
		}
	},

	updateLabel: async ({ rowId, label }: { rowId: number; label: string }) => {
		try {
			return db.row.update({ where: { id: rowId }, data: { label } });
		} catch (error) {
			throw error;
		}
	},
};
