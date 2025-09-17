import Image from "next/image";
import logoLight from "./logo.svg";
import logoDark from "./logo-dark.svg";
import { useTheme } from "next-themes";

interface LogoProps {
    width?: number;
    height?: number;
}

export default function Logo({ width = 240, height = 240 }: LogoProps) {
    const logoSrc = logoLight;
    return (
        <div className="flex flex-col items-center justify-center">
            <Image
                src={logoSrc}
                alt="devcontext logo"
                width={width}
                height={height}
                priority
                className="mb-2"
            />
            <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                devcontext
            </h1>
        </div>
    );
}