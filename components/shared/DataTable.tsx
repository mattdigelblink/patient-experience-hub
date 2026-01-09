'use client';

import React from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-100 border-b" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b last:border-0">
              <div className="flex items-center h-full px-4 gap-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-slate-200 rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    "px-4 py-3 text-left text-xs font-semibold text-slate-600 tracking-wider",
                    typeof column.header === 'string' && "uppercase"
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50'
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-700">
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key]?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

