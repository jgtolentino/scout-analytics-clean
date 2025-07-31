import React from 'react';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  format?: string;
  sticky?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: boolean;
  pageSize?: number;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  pagination = false, 
  pageSize = 10,
  className = '' 
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  
  const paginatedData = pagination 
    ? data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : data;
  
  const totalPages = Math.ceil(data.length / pageSize);

  const formatValue = (value: any, format?: string) => {
    if (value == null) return '-';
    
    switch (format) {
      case 'currency':
        return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
      case 'number':
        return Number(value).toLocaleString();
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'percentage_badge':
        const num = Number(value);
        const color = num > 0 ? 'text-green-600' : num < 0 ? 'text-red-600' : 'text-gray-600';
        return <span className={`font-medium ${color}`}>{num > 0 ? '+' : ''}{num.toFixed(1)}%</span>;
      case 'trend_badge':
        return <span className={`px-2 py-1 text-xs rounded ${value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value > 0 ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
        </span>;
      default:
        return String(value);
    }
  };

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sticky ? 'sticky left-0 bg-gray-50 z-10' : ''
                  }`}
                >
                  {column.header}
                  {column.sortable && (
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      ↕
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.field}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.sticky ? 'sticky left-0 bg-white' : ''
                    }`}
                  >
                    {formatValue(row[column.field], column.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, data.length)}
                </span>{' '}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};