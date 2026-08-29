import type { ReactNode } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

export interface AdminColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}
export function AdminDataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption: string
  columns: AdminColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
}) {
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.render(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
