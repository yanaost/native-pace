import MuiCard, { CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  header?: string;
  padding?: CardPadding;
  children?: React.ReactNode;
}

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  small: 2,
  medium: 3,
  large: 4,
};

export default function Card({ header, padding = 'medium', children, ...props }: CardProps) {
  return (
    <MuiCard {...props}>
      {header && <CardHeader title={header} />}
      <CardContent sx={{ p: paddingMap[padding] }}>
        {children}
      </CardContent>
    </MuiCard>
  );
}
