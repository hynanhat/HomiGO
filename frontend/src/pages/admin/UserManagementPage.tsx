import { useState } from 'react'
import { Badge, Button, Modal, Pagination, Textarea } from '@/components/ui'
import { ErrorState, Skeleton, useToast } from '@/components/feedback'
import { AdminDataTable } from '@/features/admin/components/AdminDataTable'
import { banUser, unbanUser } from '@/features/admin/adminApi'
import { useAdminMutation, useAdminUsers } from '@/features/admin/adminQueries'
import type { AdminUser } from '@/types/domain'
import { getSafeErrorMessage } from '@/lib/api/apiError'

export default function UserManagementPage() {
  const [page, setPage] = useState(0); const [selected, setSelected] = useState<AdminUser>(); const [reason, setReason] = useState(''); const query = useAdminUsers(page); const { showToast } = useToast(); const ban = useAdminMutation(({ id, reason }: { id: number; reason: string }) => banUser(id, reason)); const unban = useAdminMutation((id: number) => unbanUser(id))
  const runBan = async () => { if (!selected || !reason.trim()) return; try { await ban.mutateAsync({ id: selected.id, reason }); setSelected(undefined); setReason(''); showToast({ type: 'success', title: 'Đã khóa tài khoản' }) } catch (error) { showToast({ type: 'error', title: 'Không thể khóa', description: getSafeErrorMessage(error) }) } }
  const columns = [{ key: 'user', header: 'Người dùng', render: (item: AdminUser) => <div><p className="font-bold">{item.name}</p><p className="text-xs">{item.email}</p></div> }, { key: 'role', header: 'Vai trò', render: (item: AdminUser) => item.role }, { key: 'status', header: 'Trạng thái', render: (item: AdminUser) => <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>{item.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</Badge> }, { key: 'actions', header: 'Thao tác', render: (item: AdminUser) => item.status === 'ACTIVE' ? <Button size="sm" variant="danger" disabled={item.role === 'ADMIN'} onClick={() => setSelected(item)}>Khóa</Button> : <Button size="sm" variant="secondary" loading={unban.isPending} onClick={() => unban.mutate(item.id)}>Mở khóa</Button> }]
  return <div><h2 className="text-3xl font-extrabold">Quản lý người dùng</h2>{query.isPending && <Skeleton className="mt-6 h-72" />}{query.isError && <ErrorState onRetry={() => query.refetch()} />}{query.data && <div className="mt-6"><AdminDataTable caption="Danh sách người dùng" columns={columns} rows={query.data.content} rowKey={(item) => item.id} /><div className="mt-5"><Pagination page={page} totalPages={query.data.totalPages} onPageChange={setPage} /></div></div>}<Modal open={Boolean(selected)} title="Khóa tài khoản" onClose={() => setSelected(undefined)} footer={<><Button variant="secondary" onClick={() => setSelected(undefined)}>Hủy</Button><Button variant="danger" loading={ban.isPending} disabled={!reason.trim()} onClick={runBan}>Xác nhận khóa</Button></>}><Textarea label="Lý do khóa" required value={reason} onChange={(event) => setReason(event.target.value)} /></Modal></div>
}
