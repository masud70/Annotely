"use client";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SunIcon } from "./ui/icons/heroicons-sun";
import { Moon20SolidIcon } from "./ui/icons/heroicons-moon-20-solid";
import Link from "next/link";

const Navbar = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();

	return (
		<div className="h-[50px] w-full border-b-2 bg-gray-500 dark:bg-gray-800 flex justify-between items-center py-2 px-4 fixed">
			<Link href={'/'} className="font-bold text-xl">Label Data</Link>
			<div>
				<Button
					variant="ghost"
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
