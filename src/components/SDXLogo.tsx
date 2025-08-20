import { cn } from "@/lib/utils";
import sdxLogo from "@/assets/images/sdx-logo.svg";

interface SDXLogoProps {
  className?: string;
  size?: number;
}

/**
 * SDX logo component using the official logo file
 */
export function SDXLogo({ className, size = 40 }: SDXLogoProps) {
  return (
    <img 
      src={sdxLogo}
      width={size} 
      height={size}
      alt="SDX Logo"
      className={cn("", className)}
    />
  );
}