import sdxLogo from '@/assets/images/sdx-logo.svg';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-10 w-auto" }: LogoProps) {
  return (
    <img
      src={sdxLogo}
      alt="Atlantic Wave SDX Logo"
      className={className}
    />
  );
}