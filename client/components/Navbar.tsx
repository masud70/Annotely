"use client";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SunIcon } from "./ui/icons/heroicons-sun";
import { Moon20SolidIcon } from "./ui/icons/heroicons-moon-20-solid";
import Link from "next/link";

const Navbar = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();

	return (
		<div className="h-[50px] w-full border-b-2 bg-gray-500/30 dark:bg-gray-800 flex justify-between items-center py-2 px-4 fixed">
			<Link href={"/"} className="font-bold text-xl">
				{process.env.NEXT_PUBLIC_APP_NAME}
			</Link>
			<div>
				<Button
					variant="ghost"
					className={`cursor-pointer bg-gray-800/70 text-white dark:bg-gray-400/20`}
					onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
				>
					{theme === "dark" ? (
						<SunIcon size={24} />
					) : (
						<Moon20SolidIcon size={24} />
					)}
					{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
				</Button>
			</div>
		</div>
	);
};

export default Navbar;
