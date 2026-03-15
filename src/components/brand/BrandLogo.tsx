import Image from "next/image";

type BrandLogoVariant = "horizontal" | "mark";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

const logoAssets: Record<
  BrandLogoVariant,
  {
    src: string;
    width: number;
    height: number;
    sizes: string;
  }
> = {
  horizontal: {
    src: "/brand/savzix-logo-horizontal.webp",
    width: 969,
    height: 250,
    sizes: "(min-width: 768px) 180px, 140px",
  },
  mark: {
    src: "/brand/savzix-logo-mark.webp",
    width: 256,
    height: 256,
    sizes: "64px",
  },
};

export function BrandLogo({
  variant = "horizontal",
  className,
  priority = false,
}: BrandLogoProps) {
  const asset = logoAssets[variant];

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
