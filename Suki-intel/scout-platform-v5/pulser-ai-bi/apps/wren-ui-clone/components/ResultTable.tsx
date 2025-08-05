import React from 'react';
import { Download } from 'lucide-react';

interface ResultTableProps {
  data: any[];
  columns?: any[];
  title?: string;
  onExport?: (format: string) => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({ data, columns, title, onExport }) => {
  if (!data || data.length === 0) return null;

  const headers = columns?.map(c => c.label || c.name) || Object.keys(data[0]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title || 'Results'}</h3>
        <button onClick={() => onExport?.('csv')} className="p-2 hover:bg-gray-100 rounded">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((value: any, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
