export type RSS = Record<string, string>;
export type RSU = Record<string, unknown>;

export type FileSummary = {
	id: number;
	fileName: string;
	rowCount: number;
	uploadedAt: string;
	updatedAt: string;
	configured: boolean;
};

export type LabelStat = {
	label: string;
	color: string;
	count: number;
};

export type Label = {
	id?: number;
	fileId?: number;
	name: string;
	color: string;
};

export type Row = {
	data: RSS;
	fileId: number;
	id: number;
	label?: string;
    code?: string;
	theme?: string;
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
	labels: Label[];
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
