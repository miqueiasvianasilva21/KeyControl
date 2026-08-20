import React from 'react';

// --- BOTÕES E INPUTS ---
export const Button = ({
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: any) => {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants: any = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90',
    outline:
      'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
    ghost: 'hover:bg-slate-100 hover:text-slate-900',
  };
  const sizes: any = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    icon: 'h-10 w-10',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

export const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Badge = ({ className = '', ...props }: any) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${className}`}
    {...props}
  />
);

export const Label = ({ className = '', ...props }: any) => (
  <label
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
);

// --- MODAIS (DIALOGS) ---
export const Dialog = ({ open, onOpenChange, children }: any) =>
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {children}
    </div>
  ) : null;
export const DialogContent = ({ children }: any) => (
  <div className="bg-white rounded-lg shadow-lg w-full max-w-md border border-slate-200 p-6 space-y-4">
    {children}
  </div>
);
export const DialogHeader = ({ children }: any) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
    {children}
  </div>
);
export const DialogTitle = ({ children }: any) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight">
    {children}
  </h2>
);
export const DialogDescription = ({ children }: any) => (
  <p className="text-sm text-slate-500">{children}</p>
);
export const DialogFooter = ({ children }: any) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
    {children}
  </div>
);

// --- SELECTS ---
export const SelectTrigger = (props: any) => null;
export const SelectContent = (props: any) => null;
export const SelectValue = ({ placeholder }: any) => (
  <option value="" disabled>
    {placeholder}
  </option>
);
export const SelectItem = ({ value, children, disabled }: any) => (
  <option value={value} disabled={disabled}>
    {children}
  </option>
);

export const Select = ({ value, onValueChange, children }: any) => {
  let triggerChildren: any = null;
  let contentChildren: any = null;
  let selectId = '';

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const element = child as React.ReactElement<any>;

    if (element.type === SelectTrigger) {
      triggerChildren = element.props.children;
      selectId = element.props.id || '';
    } else if (element.type === SelectContent) {
      contentChildren = element.props.children;
    }
  });

  return (
    <select
      id={selectId}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {triggerChildren}
      {contentChildren}
    </select>
  );
};
