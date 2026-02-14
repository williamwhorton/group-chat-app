'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteChannelModalProps {
  channelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export default function DeleteChannelModal({
  channelId,
  open,
  onOpenChange,
  onDeleted,
}: DeleteChannelModalProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    try {
      // Delete channel (messages will cascade delete)
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)

      if (error) throw error

      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      console.error('Error deleting channel:', error)
      alert('Failed to delete channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Channel?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All messages in this channel will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
