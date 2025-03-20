import { forwardRef, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'icon';

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, IButton>(
  (
    {
      type = 'button',
      variant = 'primary',
      children,
      onClick,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const styles = {
      primary:
        'bg-blue-500 hover:bg-blue-400 active:bg-blue-300 text-white rounded-xl px-4 py-2 sm:px-6 sm:py-3 sm:w-auto font-semibold',
      secondary: 'bg-transparent text-black text-sm sm:text-base p-2',
      icon: 'h-10 w-10 sm:h-12 sm:w-12 bg-green-500 flex items-center justify-center',
    };

    // Комбинируем стили с className, если он передан
    const buttonClass = `${styles[variant]} ${className || ''}`;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClass}
        onClick={onClick}
        {...props}
      >
        {icon ? (
          <span className="flex items-center justify-center">{icon}</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

export default Button;
