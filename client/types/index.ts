export type RSS = Record<string, string>;

export type FileSummary = {
	id: number;
	fileName: string;
	rowCount: number;
	uploadedAt: string;
	updatedAt: string;
	configured: boolean;
};

export type Row = {
	data: RSS;
	fileId: number;
	id: number;
	label: string;
};

export type Dataset = {
	id: number;
	fileName: string;
	uploadedAt: string;
	updatedAt: string;
	fileType: string;
	columns: string[];
	highlightColor: string;
	keywords: string[];
	selectedColumns: string[];
	configured: boolean;
	keyColumn: string;
	labels: {
		name: string;
		color: string;
	}[];
	_count: {
		row: number;
	};
	rows: Row[];
};

export type Token =
	| {
			pattern: string;
			color: string;
			mode?: "literal" | "word";
			flags?: string;
	  }
	| { pattern: RegExp; color: string; flags?: string };
