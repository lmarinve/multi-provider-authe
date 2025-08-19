import { cn } from "@/lib/utils";

interface SDXLogoProps {
  className?: string;
  size?: number;
}

/**
 * SDX circular logo component
 * Features the characteristic blue circular swirl design
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
      <defs>
        <linearGradient id="sdx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="50%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
      </defs>
      
      {/* Main circular swirl path */}
      <path
        d="M50 10 
           C70 10 85 25 85 45
           C85 55 80 65 70 70
           C65 72 60 70 58 65
           C56 60 60 55 65 55
           C70 55 75 50 75 45
           C75 35 65 25 50 25
           C35 25 25 35 25 50
           C25 65 35 75 50 75
           C60 75 70 70 75 62
           C78 58 82 60 82 65
           C80 75 65 85 50 85
           C30 85 15 70 15 50
           C15 30 30 15 50 15"
        fill="url(#sdx-gradient)"
        stroke="none"
      />
      
      {/* Inner accent curve */}
      <path
        d="M50 20
           C65 20 78 33 78 48
           C78 58 72 67 63 70"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}