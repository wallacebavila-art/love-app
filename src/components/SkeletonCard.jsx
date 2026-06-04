import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Componente SkeletonCard para loading consistente
 * @param {Object} props
 * @param {string} props.className - Classes CSS adicionais
 * @param {number} props.height - Altura do skeleton (padrão: 100%)
 * @param {number} props.width - Largura do skeleton (padrão: 100%)
 * @param {boolean} props.rounded - Se deve ter bordas arredondadas (padrão: true)
 * @param {boolean} props.animate - Se deve ter animação (padrão: true)
 */
const SkeletonCard = ({ 
  className = '', 
  height = '100%', 
  width = '100%', 
  rounded = true,
  animate = true 
}) => {
  const { getCardBackground, getBorderColor } = useTheme();

  return (
    <div 
      className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} ${className} ${animate ? 'animate-pulse' : ''}`}
      style={{
        height,
        width,
        borderRadius: rounded ? '32px' : '0',
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div 
            className="bg-white/20 rounded-full"
            style={{ width: '48px', height: '48px' }}
          />
          <div 
            className="bg-white/20 rounded"
            style={{ width: '120px', height: '12px' }}
          />
          <div 
            className="bg-white/20 rounded"
            style={{ width: '80px', height: '10px' }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Componente SkeletonText para texto em loading
 */
export const SkeletonText = React.memo(({ 
  width = '100%', 
  height = '16px', 
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white/20 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
});

/**
 * Componente SkeletonCircle para círculos em loading
 */
export const SkeletonCircle = React.memo(({ 
  size = '48px', 
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white/20 rounded-full animate-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  );
});

/**
 * Componente SkeletonAvatar para avatares em loading
 */
export const SkeletonAvatar = React.memo(({ 
  size = '48px', 
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white/20 rounded-full animate-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  );
});

export default React.memo(SkeletonCard);
