"use client";

import * as React from "react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";

type HttpMethod = "DELETE" | "POST" | "PUT" | "PATCH";

export function ConfirmAlert({
	open,
	onOpenChange,
	text,
	url,
	method = "DELETE",
	payload,
	headers,
	confirmLabel = "Yes, confirm",
	cancelLabel = "Cancel",
	title = "Please confirm",
	onDone,
	onError,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	text: string;
	url: string;
	method?: HttpMethod;
	payload?: unknown;
	headers?: Record<string, string>;
	confirmLabel?: string;
	cancelLabel?: string;
	title?: string;
	onDone?: () => void;
	onError?: (err: unknown) => void;
}) {
	const [loading, setLoading] = React.useState(false);

	const handleConfirm = async () => {
		try {
			setLoading(true);
			const hasBody = payload !== undefined && method !== "DELETE";
			const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + url, {
				method,
				headers: {
					...(hasBody ? { "Content-Type": "application/json" } : {}),
					...headers,
				},
				body: hasBody ? JSON.stringify(payload) : undefined,
			});
			if (!res.ok) {
				const msg =
					(await res.text()) || `Request failed (${res.status})`;
				throw new Error(msg);
			}
			const json = await res.json();
			console.log(json);
			onOpenChange(false);
			onDone?.();
		} catch (e) {
			onError?.(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{text}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={loading}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{loading ? "Working..." : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
