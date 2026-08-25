import type { FormEvent, ReactNode } from 'react'
import { Button, Modal } from '@/components/ui'
export function EntityFormDialog({ open, title, children, submitting, onClose, onSubmit }: { open: boolean; title: string; children: ReactNode; submitting?: boolean; onClose: () => void; onSubmit: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit() }
  return <Modal open={open} title={title} onClose={onClose}><form className="grid gap-4" onSubmit={submit}>{children}<div className="mt-2 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Hủy</Button><Button type="submit" loading={submitting}>Lưu</Button></div></form></Modal>
}
