import { TadpoleIcon } from "./icons/svg-spinners-tadpole";

const Loader = ({
	text = "Loading...",
	global = false,
	show,
	transparency = 90, // 0–100
}: {
	text?: string;
	global?: boolean;
	show: boolean;
	transparency?: number;
}) => {
	const alpha = Math.min(Math.max(transparency, 0), 100) / 100;

	return (
		<div
			hidden={!show}
			className={`${
				global && "fixed"
			} inset-0 duration-0 z-50 py-4 flex flex-col items-center justify-center`}
			style={{ backgroundColor: `rgba(31, 41, 55, ${alpha})` }}
		>
			<p className="mb-2 text-white">{text}</p>
			<TadpoleIcon className="duration-0" size={40} />
		</div>
	);
};

export default Loader;
