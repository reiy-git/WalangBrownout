export function TableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-[#d8b4fe]/50 animate-pulse">
      <table className="table table-md w-full">
        <thead>
          <tr className="bg-[#ede9fe]/40">
            {Array.from({ length: columns }, (_, index) => (
              <th key={index}><div className="h-3 w-20 rounded bg-[#d8b4fe]/60" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-[#ede9fe]">
              {Array.from({ length: columns }, (_, column) => (
                <td key={column}><div className="h-3 rounded bg-[#ede9fe]" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-24 rounded-xl bg-[#ede9fe] border border-[#ddd6fe]" />
      ))}
    </div>
  );
}
