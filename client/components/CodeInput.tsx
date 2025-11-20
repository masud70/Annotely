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
import { useEffect, useMemo, useRef, useState } from "react";
import { SaveFnType } from "@/types";

export const CodeInput = ({
	rowId,
	defaultValues,
	placeholder,
	onSave,
	suggestions = [],
}: {
	rowId: string;
	defaultValues: string;
	placeholder?: string;
	onSave: SaveFnType;
	suggestions?: string[];
}) => {
	const [input, setInput] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const listRef = useRef<HTMLUListElement | null>(null);
	const [values, setValues] = useState<string[]>(
		() =>
			defaultValues
				?.split(",")
				.map((s) => s.trim())
				.filter(Boolean) ?? []
	);

	const normSuggestions = useMemo(
		() =>
			(suggestions ?? [])
				.map((s) => (s ?? "").toString().trim())
				.filter(Boolean),
		[suggestions]
	);

	const filtered = useMemo(() => {
		const selected = new Set(values.map((v) => v.toLowerCase()));
		const base = normSuggestions.filter(
			(s) => !selected.has(s.toLowerCase())
		);

		const q = (input ?? "").trim().toLowerCase();
		if (!q) return base.slice(0, 12);
		return base.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
	}, [input, normSuggestions, values]);

	useEffect(() => {
		setActive(0);
	}, [input, filtered.length]);

	const addValue = (v: string) => {
		const val = v.trim();
		if (!val) return;
		if (!values.includes(val)) setValues((prev) => [...prev, val]);
		setInput("");
		setOpen(false);
	};

	const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		const data = [input, ...filtered];
		if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
			if (data.length) setOpen(true);
			return;
		}
		if (!open || data.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((i) => Math.min(i + 1, data.length - 1));
			// ensure visibility
			listRef.current
				?.querySelectorAll<HTMLLIElement>("[role='option']")
				[Math.min(active + 1, data.length - 1)]?.scrollIntoView({
					block: "nearest",
				});
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.max(i - 1, 0));
			listRef.current
				?.querySelectorAll<HTMLLIElement>("[role='option']")
				[Math.max(active - 1, 0)]?.scrollIntoView({ block: "nearest" });
		} else if (e.key === "Enter") {
			if (active >= 0 && data[active]) {
				e.preventDefault();
				addValue(data[active]);
			}
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div className="relative">
			{open && (input?.trim() || filtered.length > 0) && (
				<ul
					ref={listRef}
					role="listbox"
					className={
						"absolute left-0 right-[100px] bottom-full mb-1 " +
						"max-h-56 overflow-auto rounded-md border border-gray-300 dark:border-gray-700 " +
						"bg-white dark:bg-gray-900 shadow-md z-50 " +
						scrollbar
					}
				>
					{[input, ...filtered].map(
						(s, i) =>
							s?.trim() && (
								<li
									key={s}
									role="option"
									aria-selected={i === active}
									tabIndex={-1}
									className={`px-3 py-2 cursor-pointer select-none ${
										i === active
											? "bg-gray-200 dark:bg-gray-700"
											: "hover:bg-gray-100 dark:hover:bg-gray-800"
									}`}
									onMouseUp={() => setActive(i)}
									onMouseDown={(e) => {
										e.preventDefault();
										addValue(s ?? "");
									}}
								>
									{s}
								</li>
							)
					)}
				</ul>
			)}
			<TagsInput
				value={values}
				onValueChange={setValues}
				editable
				addOnPaste
				className="flex flex-row min-w-full h-[85px] overflow-hidden"
			>
				<TagsInputList
					className={
						"overflow-y-auto w-full border-2 focus-within:ring-0" +
						scrollbar
					}
					onFocus={() => {
						if (filtered.length) setOpen(true);
					}}
					onBlur={(e) => {
						// close when focus leaves the whole control (not when moving inside)
						if (
							!e.currentTarget.contains(e.relatedTarget as Node)
						) {
							setOpen(false);
						}
					}}
				>
					{values.map((value, id) => (
						<TagsInputItem key={id} value={value}>
							<div className="text-balance text-wrap">
								{value}
							</div>
						</TagsInputItem>
					))}
					<TagsInputInput
						placeholder={placeholder ?? "Add new input..."}
						value={input ?? ""}
						onChange={(e) => {
							setInput(e.target.value);
							setOpen(true);
						}}
						onClick={() => setOpen(true)}
						onKeyDown={onKeyDown}
					/>
				</TagsInputList>
				<div className="grid">
					<TagsInputClear asChild>
						<Button
							variant="outline"
							onClick={() => {
								setValues([]);
								setInput("");
								setOpen(false);
							}}
						>
							<RefreshCcw className="h-4 w-4" />
							Clear
						</Button>
					</TagsInputClear>
					<Button
						className="min-w-[85px]"
						onClick={async () =>
							await onSave({ rowId: rowId, values: values })
						}
					>
						Save
					</Button>
				</div>
			</TagsInput>
		</div>
	);
};
