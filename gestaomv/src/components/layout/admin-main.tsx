import type { ReactNode } from 'react';

interface AdminMainProps {
  header?: ReactNode;
  children?: ReactNode;
}

export function AdminMain({ header, children }: AdminMainProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0">
      {header}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
        <div className="p-4 min-w-0">{children}</div>
      </div>
    </main>
  );
}
