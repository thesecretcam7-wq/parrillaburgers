'use client';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'default' | 'inline' | 'overlay';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} loading-spinner`}
      style={{
        borderColor: 'rgba(212, 160, 23, 0.2)',
        borderTopColor: '#D4A017',
        borderRadius: '50%',
      }}
      role="status"
      aria-label="Cargando..."
    />
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2">
        {spinner}
        {message && <span className="text-sm text-brand-gray">{message}</span>}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className={`${sizeClasses['lg']} loading-spinner`}
            style={{
              borderColor: 'rgba(212, 160, 23, 0.2)',
              borderTopColor: '#D4A017',
              borderRadius: '50%',
            }}
          />
          {message && (
            <p className="text-white text-center font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {message && (
        <p className="text-sm text-brand-gray text-center">{message}</p>
      )}
    </div>
  );
}
