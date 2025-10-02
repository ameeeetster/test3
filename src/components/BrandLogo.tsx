import React from 'react';
import { LucideIcon, Cloud } from 'lucide-react';
import { getBrandConfig, getBrandBackgroundColor } from '../lib/brandIcons';

interface BrandLogoProps {
  /** Connector type ID (e.g., 'azure-ad', 'workday') */
  connectorType?: string;
  /** Fallback Lucide icon if brand not found */
  fallbackIcon?: LucideIcon;
  /** Size of the container in pixels */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show background */
  showBackground?: boolean;
  /** Background opacity (0-1) */
  backgroundOpacity?: number;
  /** Whether to show border */
  showBorder?: boolean;
  /** Border opacity (0-1) - defaults to 2x background opacity */
  borderOpacity?: number;
  /** Custom className for container */
  className?: string;
}

const sizeConfig = {
  sm: { container: 'w-16 h-16', icon: 'w-8 h-8', imagePadding: 'p-2' },
  md: { container: 'w-20 h-20', icon: 'w-10 h-10', imagePadding: 'p-3' },
  lg: { container: 'w-24 h-24', icon: 'w-12 h-12', imagePadding: 'p-3.5' },
  xl: { container: 'w-28 h-28', icon: 'w-14 h-14', imagePadding: 'p-4' },
};

/**
 * BrandLogo component - Displays brand-specific logos using Iconify
 * Falls back to Lucide icons if brand not found or Iconify unavailable
 */
export function BrandLogo({
  connectorType,
  fallbackIcon: FallbackIcon,
  size = 'md',
  showBackground = true,
  backgroundOpacity = 0.1,
  showBorder = false,
  borderOpacity,
  className = '',
}: BrandLogoProps) {
  const brandConfig = connectorType ? getBrandConfig(connectorType) : null;
  const sizes = sizeConfig[size];

  // Use brand config if available, otherwise fallback
  const usesBrand = !!brandConfig;
  const iconColor = usesBrand ? brandConfig.color : 'var(--primary)';
  const bgColor = usesBrand
    ? getBrandBackgroundColor(brandConfig.color, backgroundOpacity)
    : `rgba(79, 70, 229, ${backgroundOpacity})`;
  
  const borderColor = showBorder
    ? usesBrand
      ? getBrandBackgroundColor(brandConfig.color, borderOpacity ?? backgroundOpacity * 2)
      : `rgba(79, 70, 229, ${borderOpacity ?? backgroundOpacity * 2})`
    : 'transparent';

  // Determine which icon to use
  const IconComponent = FallbackIcon || Cloud;

  return (
    <div
      className={`${sizes.container} rounded-lg flex items-center justify-center ${brandConfig?.isImage ? sizes.imagePadding : ''} ${className}`}
      style={{
        backgroundColor: showBackground ? bgColor : 'transparent',
        border: showBorder ? `1px solid ${borderColor}` : 'none',
      }}
    >
      {usesBrand ? (
        brandConfig.isImage ? (
          <img
            src={brandConfig.icon}
            alt={`${brandConfig.label} logo`}
            className="w-full h-full"
            style={{ 
              objectFit: 'contain',
              display: 'block'
            }}
          />
        ) : (
          <IconifyIconWrapper
            icon={brandConfig.icon}
            className={sizes.icon}
            style={{ color: iconColor }}
            aria-label={`${brandConfig.label} logo`}
            fallback={<IconComponent className={sizes.icon} style={{ color: iconColor }} />}
          />
        )
      ) : (
        <IconComponent className={sizes.icon} style={{ color: iconColor }} />
      )}
    </div>
  );
}

/**
 * Wrapper component that safely loads Iconify icons with fallback
 */
function IconifyIconWrapper({
  icon,
  className,
  style,
  fallback,
  ...props
}: {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
  fallback: React.ReactNode;
  [key: string]: any;
}) {
  const [error, setError] = React.useState(false);
  const [IconifyIcon, setIconifyIcon] = React.useState<any>(null);

  React.useEffect(() => {
    // Dynamically import Iconify
    import('@iconify/react')
      .then((module) => {
        setIconifyIcon(() => module.Icon);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  // Show fallback while loading or on error
  if (error || !IconifyIcon) {
    return <>{fallback}</>;
  }

  return <IconifyIcon icon={icon} className={className} style={style} {...props} />;
}
