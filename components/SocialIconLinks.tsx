import Image from "next/image";

const ICON = 42;

const linkClass =
  "flex shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-white/25 shadow hover:opacity-90 transition-opacity size-[42px] bg-white/5";

/**
 * X / Facebook / WhatsApp from `/X.svg`, `/facebook.svg`, `/whatsapp.svg` (public root).
 * X asset is dark; inverted on dark UI. Facebook & WhatsApp keep brand colours.
 */
export function SocialIconLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="https://x.com/institutetax?s=21"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="X (Twitter)"
      >
        <Image
          src="/X.svg"
          alt=""
          width={ICON}
          height={ICON}
          unoptimized
          className="size-[42px] brightness-0 invert"
        />
      </a>
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Facebook"
      >
        <Image
          src="/facebook.svg"
          alt=""
          width={ICON}
          height={ICON}
          unoptimized
          className="size-[42px] object-contain"
        />
      </a>
      <a
        href="7019063788"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="WhatsApp"
      >
        <Image
          src="/whatsapp.svg"
          alt=""
          width={ICON}
          height={ICON}
          unoptimized
          className="size-[42px] object-contain"
        />
      </a>
    </div>
  );
}
