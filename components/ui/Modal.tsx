import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

export interface ModalProps extends Omit<DialogProps, 'title'> {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Modal({
  title,
  actions,
  children,
  onClose,
  ...props
}: ModalProps) {
  return (
    <Dialog onClose={onClose} {...props}>
      {title && (
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {title}
            {onClose && (
              <IconButton
                aria-label="close"
                onClick={(e) => onClose(e, 'escapeKeyDown')}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
