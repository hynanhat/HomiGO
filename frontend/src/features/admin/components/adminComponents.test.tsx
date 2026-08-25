import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminDataTable } from './AdminDataTable'
import { ConflictNotice } from './ConflictNotice'
import { DeleteConfirmation } from './DeleteConfirmation'
import { EntityFormDialog } from './EntityFormDialog'
import { Input } from '@/components/ui'

describe('admin reusable components', () => {
  it('renders semantic table and conflict reload', () => { const reload = vi.fn(); render(<><AdminDataTable caption="Dữ liệu" columns={[{ key: 'name', header: 'Tên', render: (row: { name: string }) => row.name }]} rows={[{ name: 'Căn hộ' }]} rowKey={(row) => row.name} /><ConflictNotice onReload={reload} /></>); expect(screen.getByRole('table', { name: 'Dữ liệu' })).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: 'Tải lại' })); expect(reload).toHaveBeenCalled() })
  it('requires explicit confirmation and submits entity forms', () => { const confirm = vi.fn(); const submit = vi.fn(); const close = vi.fn(); const { rerender } = render(<DeleteConfirmation open name="Căn hộ" onClose={close} onConfirm={confirm} />); fireEvent.click(screen.getByRole('button', { name: 'Xóa' })); expect(confirm).toHaveBeenCalled(); rerender(<EntityFormDialog open title="Thêm" onClose={close} onSubmit={submit}><Input label="Tên" /></EntityFormDialog>); fireEvent.click(screen.getByRole('button', { name: 'Lưu' })); expect(submit).toHaveBeenCalled() })
})
