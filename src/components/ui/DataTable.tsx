import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState.tsx'
import { Table, TBody, TD, TH, THead, TR } from './Table.tsx'

export type Column<T> = {
  key: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle = 'Nada por aqui',
  emptyDescription = 'Tente outro filtro ou termo de busca.',
}: Props<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Table>
      <THead>
        {columns.map((col) => (
          <TH key={col.key} className={col.className}>
            {col.header}
          </TH>
        ))}
      </THead>
      <TBody>
        {rows.map((row) => (
          <TR key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map((col) => (
              <TD key={col.key} className={col.className}>
                {col.render(row)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  )
}
