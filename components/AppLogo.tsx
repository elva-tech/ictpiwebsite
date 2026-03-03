import Image from "next/image";

/** Single source for ICTPI logo – use this everywhere for a uniform look. */
const LOGO_SRC = "/images/ICTPL_image.jpg";

const VARIANTS = {
  /** Header/nav (sidebar, app header) – same size across all authenticated pages */
  header: {
    width: 100,
    height: 110,
    className: "h-16 w-16 md:h-20 md:w-20 object-contain flex-shrink-0",
  },
  /** Login / small card */
  card: {
    width: 140,
    height: 154,
    className: "h-24 w-auto object-contain",
  },
  /** Hero / landing (e.g. main page) */
  hero: {
    width: 360,
    height: 252,
    className: "mx-auto object-contain drop-shadow-2xl w-full max-w-[320px] md:max-w-[360px]",
  },
} as const;

type LogoVariant = keyof typeof VARIANTS;

interface AppLogoProps {
  variant?: LogoVariant;
  alt?: string;
  priority?: boolean;
  className?: string;
}

export function AppLogo({
  variant = "header",
  alt = "ICTPI Logo",
  priority = false,
  className,
}: AppLogoProps) {
  const { width, height, className: variantClass } = VARIANTS[variant];
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={width}
      height={height}
      className={className ?? variantClass}
      priority={priority}
    />
  );
}

export { LOGO_SRC };
