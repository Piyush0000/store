'use client';

import './FloatingLogo.css';

interface FloatingLogoProps {
  config: {
    enabled?: boolean;
    imageUrl?: string;
    linkUrl?: string;
  };
}

export default function FloatingLogo({ config }: FloatingLogoProps) {
  if (!config.enabled || !config.imageUrl) {
    return null;
  }

  const href = config.linkUrl || '#';
  const isExternal = href.startsWith('http://') || href.startsWith('https://');

  return (
    <div className="floating-logo">
      <a 
        href={href} 
        target={isExternal ? '_blank' : '_self'} 
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="floating-logo__link"
      >
        <img 
          src={config.imageUrl} 
          alt="Floating Logo" 
          className="floating-logo__img" 
        />
      </a>
    </div>
  );
}
