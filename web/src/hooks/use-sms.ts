import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { sendBulkSMS } from '@/lib/sms'
import type { SMSMessage, SMSStatus } from '@/types'
import type { SMSRecipient, SMSBatchResult } from '@/lib/sms'

const SMS_KEY = ['sms-messages']

/**
 * Fetch SMS message history
 */
export function useSMSMessages(options?: { limit?: number; status?: SMSStatus }) {
  return useQuery({
    queryKey: [...SMS_KEY, options],
    queryFn: async () => {
      let q = query(
        collection(db, 'sms_messages'),
        orderBy('createdAt', 'desc'),
        limit(options?.limit || 50)
      )

      if (options?.status) {
        q = query(
          collection(db, 'sms_messages'),
          where('status', '==', options.status),
          orderBy('createdAt', 'desc'),
          limit(options?.limit || 50)
        )
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as SMSMessage[]
    },
  })
}

interface SendSMSInput {
  recipients: SMSRecipient[]
  content: string
  sentBy: string
  targetVillages?: string[]
}

/**
 * Send bulk SMS and save to Firestore
 */
export function useSendSMS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recipients, content, sentBy, targetVillages }: SendSMSInput) => {
      // Create SMS record in Firestore first
      const smsDoc = await addDoc(collection(db, 'sms_messages'), {
        recipients: recipients.map((r) => r.phone),
        content,
        status: 'pending' as SMSStatus,
        sentBy,
        targetVillages: targetVillages || [],
        deliveredCount: 0,
        failedCount: 0,
        createdAt: serverTimestamp(),
      })

      // Send SMS via provider
      const result: SMSBatchResult = await sendBulkSMS(recipients, content)

      // Update SMS record with results
      await updateDoc(doc(db, 'sms_messages', smsDoc.id), {
        status: result.totalFailed === 0 ? 'sent' : 'failed',
        deliveredCount: result.totalSent,
        failedCount: result.totalFailed,
        sentAt: serverTimestamp(),
      })

      return {
        messageId: smsDoc.id,
        ...result,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SMS_KEY })
    },
  })
}

/**
 * Get SMS statistics
 */
export function useSMSStats() {
  return useQuery({
    queryKey: [...SMS_KEY, 'stats'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'sms_messages'))

      let totalSent = 0
      let totalFailed = 0
      let totalMessages = 0

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        totalMessages++
        totalSent += data.deliveredCount || 0
        totalFailed += data.failedCount || 0
      })

      return {
        totalMessages,
        totalSent,
        totalFailed,
        successRate: totalSent + totalFailed > 0
          ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
          : 0,
      }
    },
  })
}
