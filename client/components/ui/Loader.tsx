import { TadpoleIcon } from "./icons/svg-spinners-tadpole";

const Loader = ({ text, show }: { text: string; show: boolean }) => {
	return (
		<div
			hidden={!show}
			className="fixed z-index bg-gray-800/90 w-full h-full flex flex-col justify-center items-center"
		>
			<p>{text}</p>
			<TadpoleIcon size={40} />
		</div>
	);
};

export default Loader;
