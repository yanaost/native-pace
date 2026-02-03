import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantMap: Record<ButtonVariant, { variant: MuiButtonProps['variant']; color: MuiButtonProps['color'] }> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  outline: { variant: 'outlined', color: 'primary' },
};

export default function Button({ variant = 'primary', size = 'medium', ...props }: ButtonProps) {
  const { variant: muiVariant, color } = variantMap[variant];
  return <MuiButton variant={muiVariant} color={color} size={size} {...props} />;
}
