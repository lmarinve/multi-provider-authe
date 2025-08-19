import { cn } from "@/lib/utils";

interface SDXLogoProps {
  className?: string;
  size?: number;
}

/**
 * SDX logo component using the official logo design
 */
export function SDXLogo({ className, size = 40 }: SDXLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={cn("", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue gradient arc */}
      <path d="M20 35 C30 15, 60 15, 80 35" stroke="url(#blueGradient)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      
      {/* Dark blue/navy curved element */}
      <path d="M20 65 C30 85, 60 85, 80 65" stroke="url(#navyGradient)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#00bfff", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#0080ff", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#003366", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1a5490", stopOpacity:1}} />
        </linearGradient>
      </defs>
    </svg>
  );
}