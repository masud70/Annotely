"use strict";
// ./src/service/labelService.ts
const { db } = require("../lib/db");
module.exports = {
    getDatasetAndConfigById: async (id) => {
        try {
            const result = await db.file.findUniqueOrThrow({
                include: {
                    labels: true,
                    rows: {
                        orderBy: { rowIndex: "asc" },
                    },
                    _count: { select: { rows: true } },
                },
                where: { id },
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    updateLabel: async ({ rowId, label }) => {
        try {
            return await db.row.update({
                where: { id: rowId },
                data: { label },
            });
        }
        catch (error) {
            throw error;
        }
    },
    updateCode: async ({ rowId, codes, }) => {
        try {
            return db.row.update({
                where: { id: rowId },
                data: {
                    code: codes.map((v) => v.trim()).join(", "),
                },
            });
        }
        catch (error) {
            throw error;
        }
    },
    updateTheme: async ({ rowId, themes, }) => {
        try {
            return db.row.update({
                where: { id: rowId },
                data: {
                    theme: themes.map((v) => v.trim()).join(", "),
                },
            });
        }
        catch (error) {
            throw error;
        }
    },
    updateNote: async ({ rowId, note }) => {
        try {
            return db.row.update({
                where: { id: rowId },
                data: {
                    note: note.trim(),
                },
            });
        }
        catch (error) {
            throw error;
        }
    },
};
//# sourceMappingURL=labelService.js.map