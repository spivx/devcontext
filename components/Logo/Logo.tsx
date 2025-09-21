import Image from "next/image";

interface LogoProps {
    width?: number;
    height?: number;
}

export default function Logo({ width = 350, height = 350 }: LogoProps) {
    const logoSrc = "/logo.png";
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

        </div>
    );
}