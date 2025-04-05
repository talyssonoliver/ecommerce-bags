import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || `input-${generatedId}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block mb-2 text-body-small font-medium">
            {label}
          </label>
        )}
        <input
          id={id}
          className={`
            w-full px-4 py-3 rounded-input border 
            ${error 
              ? 'border-error focus:border-error focus:ring-error/30' 
              : 'border-medium-grey focus:border-artisanal-amber focus:ring-artisanal-amber/30'
            }
            focus:outline-none focus:ring-2 transition-colors
            disabled:opacity-60 disabled:bg-light-grey
            ${className || ''}
          `}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-error text-body-small">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="mt-1 text-dark-grey text-body-small">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };