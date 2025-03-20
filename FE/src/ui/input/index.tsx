import React, {
  forwardRef,
  ChangeEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  Ref,
} from 'react';
import clsx from 'clsx';

type InputVariant = 'primary' | 'secondary' | 'error';

interface BaseProps {
  className?: string;
  variant?: InputVariant;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  name?: string;
  value?: string | number;
  style?: React.CSSProperties;
}

type InputSpecificProps = InputHTMLAttributes<HTMLInputElement> & {
  type?: 'text' | 'email' | 'password'; // Убираем 'checkbox'
};

type TextareaSpecificProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  type?: 'textarea';
};

type InputProps = BaseProps & (InputSpecificProps | TextareaSpecificProps);

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      variant = 'primary',
      type = 'text',
      onChange,
      onBlur,
      className,
      placeholder,
      name,
      value,
      style,
      ...props
    },
    ref
  ) => {
    const styles: { [key in InputVariant]: string } = {
      primary:
        'placeholder:font-light placeholder:text-sm border border-gray-300 rounded py-2 px-3 sm:py-3 sm:px-5 bg-gray-50 text-sm sm:text-base focus:border-blue-500 focus:outline-none w-full max-w-[268px]',
      secondary:
        'border border-blue-300 rounded py-2 px-3 sm:py-3 sm:px-5 bg-white text-sm sm:text-base focus:border-blue-500 focus:outline-none w-full max-w-[268px]',
      error:
        'placeholder:font-light placeholder:text-sm border border-red-300 rounded py-2 px-3 sm:py-3 sm:px-5 bg-red-50 text-sm sm:text-base focus:border-red-500 focus:outline-none w-full max-w-[268px]',
    };

    const inputClass = clsx(styles[variant], className);

    if (type === 'textarea') {
      return (
        <textarea
          ref={ref as Ref<HTMLTextAreaElement>}
          className={clsx(inputClass, 'h-38 sm:h-24 lg:h-32 resize-none')}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          name={name}
          value={value as string}
          style={style}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        ref={ref as Ref<HTMLInputElement>}
        className={inputClass}
        type={type}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        name={name}
        value={value}
        style={style}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }
);

export default Input;
