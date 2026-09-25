import Image from "next/image";

type BrandLogoVariant = "horizontal" | "mark" | "wordmark";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

const logoAssets: Record<
  Exclude<BrandLogoVariant, "wordmark">,
  {
    src: string;
    width: number;
    height: number;
    sizes: string;
  }
> = {
  horizontal: {
    src: "/brand/savzix-logo-transparent.webp",
    width: 814,
    height: 201,
    sizes: "(min-width: 768px) 146px, 130px",
  },
  mark: {
    src: "/brand/savzix-logo-icon-transparent.png",
    width: 216,
    height: 216,
    sizes: "64px",
  },
};

export function BrandLogo({
  variant = "horizontal",
  className,
  priority = false,
}: BrandLogoProps) {
  const asset = logoAssets[variant === "wordmark" ? "horizontal" : variant];

  return (
    <Image
      src={asset.src}
      alt="Savzix"
      width={asset.width}
      height={asset.height}
      sizes={asset.sizes}
      priority={priority}
      className={className}
    />
  );
}
