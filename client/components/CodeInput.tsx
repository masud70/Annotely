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
  defaultValues,
  placeholder,
  onSave,
}: {
  rowId: string;
  defaultValues: string;
  placeholder?: string;
  onSave: ({
    rowId,
    values,
  }: {
    rowId: string;
    values: string[];
  }) => Promise<void>;
}) => {
  const [values, setValues] = useState<string[]>(() =>
    defaultValues ? defaultValues.split(",") : []
  );

  return (
    <TagsInput
      value={values}
      onValueChange={setValues}
      editable
      addOnPaste
      className="flex flex-row w-full h-[85px] overflow-hidden"
    >
      <TagsInputList
        className={
          "overflow-y-auto w-[100%] border-2 focus-within:ring-0" + scrollbar
        }
      >
        {values.map((value, id) => (
          <TagsInputItem key={id} value={value}>
            <div className="text-balance text-wrap">{value}</div>
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder={placeholder ?? "Add new input..."} />
      </TagsInputList>
      <div className="grid">
        <TagsInputClear asChild>
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4" />
            Clear
          </Button>
        </TagsInputClear>
        <Button
          onClick={async () => await onSave({ rowId: rowId, values: values })}
        >
          Save
        </Button>
      </div>
    </TagsInput>
  );
};
