interface SDXLogoProps {
  className?: string;
  size?: number;
}

export function SDXLogo({ className = "", size = 80 }: SDXLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First curved figure - top */}
      <path 
        d="M25 15 Q50 5 75 15 Q60 30 50 40 Q40 30 25 15" 
        fill="#3287C8" 
        opacity="0.9"
      />
      
      {/* Second curved figure - bottom left */}
      <path 
        d="M15 45 Q5 70 15 85 Q30 75 40 60 Q30 45 15 45" 
        fill="#2E5C8A" 
        opacity="0.8"
      />
      
      {/* Third curved figure - bottom right */}
      <path 
        d="M60 60 Q75 75 85 85 Q70 95 55 85 Q45 70 60 60" 
        fill="#4A9FDC" 
        opacity="0.7"
      />
    </svg>
  );
}