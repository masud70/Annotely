import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const CheckboxItem = ({
	text = "Option",
	checked = false,
	onClick,
}: {
	text: string;
	checked: boolean;
	onClick: () => void;
}) => {
	return (
		<Label
			onClick={onClick}
			className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border border-gray-400 p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
		>
			<Checkbox
				id="toggle-2"
				checked={checked}
				className="data-[state=checked]:border-blue-600/60 data-[state=checked]:bg-blue-600/60 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 border-gray-400"
			/>
			<div className="grid font-normal w-full">
				<p className="text-sm leading-none font-medium">{text}</p>
			</div>
		</Label>
	);
};

export default CheckboxItem;
