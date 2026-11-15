// src/components/common/Button.tsx
import React, { type ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-mint text-text hover:bg-softMint',
  danger: 'bg-error text-white hover:bg-error/80',
  outline: 'border border-primary text-primary hover:bg-primary/10',
};

export const Button: React.FC<Props> = ({ variant = 'primary', className, children, ...rest }) => {
  return (
    <button
      className={classNames('px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary', variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
