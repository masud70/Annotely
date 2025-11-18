"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	TagsInput,
	TagsInputClear,
	TagsInputInput,
	TagsInputItem,
	TagsInputList,
} from "@/components/ui/tags-input";
import { scrollbar } from "@/lib/utils";
import { useState } from "react";

export const CodeInput = ({
	rowId,
	code,
	onSave,
}: {
	rowId: string;
	code: string;
	onSave: ({
		rowId,
		codes,
	}: {
		rowId: string;
		codes: string[];
	}) => Promise<void>;
}) => {
	const [codes, setCodes] = useState<string[]>(() =>
		code ? code.split(",") : []
	);

	return (
		<TagsInput
			value={codes}
			onValueChange={setCodes}
			editable
			addOnPaste
			className="flex flex-row min-w-full overflow-hidden"
		>
			<TagsInputList
				className={
					"overflow-y-auto max-h-[80px] w-[100%] border-2 focus-within:ring-0" +
					scrollbar
				}
			>
				{codes.map((code, id) => (
					<TagsInputItem key={id} value={code}>
						<div className="text-balance text-wrap">{code}</div>
					</TagsInputItem>
				))}
				<TagsInputInput placeholder="Add new code..." className="" />
			</TagsInputList>
			<div className="grid gap-0.5">
				<TagsInputClear asChild>
					<Button variant="outline">
						<RefreshCcw className="h-4 w-4" />
						Clear
					</Button>
				</TagsInputClear>
				<Button
					onClick={async () => await onSave({ rowId: rowId, codes })}
				>
					Save
				</Button>
			</div>
		</TagsInput>
	);
};
