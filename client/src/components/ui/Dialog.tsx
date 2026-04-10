import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;
const DialogClose = RadixDialog.Close;

function DialogOverlay({ className, ...props }: RadixDialog.DialogOverlayProps) {
  return (
    <RadixDialog.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: RadixDialog.DialogContentProps & { title?: string; description?: string }) {
  return (
    <RadixDialog.Portal>
      <DialogOverlay />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-border bg-card p-6 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <RadixDialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </RadixDialog.Title>
            )}
            {description && (
              <RadixDialog.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </RadixDialog.Description>
            )}
          </div>
        )}
        {children}
        <RadixDialog.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <X size={16} />
          <span className="sr-only">Close</span>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogClose };
