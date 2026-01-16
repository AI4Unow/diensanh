import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { ConfirmationResult } from 'firebase/auth'
import { setupRecaptcha } from '@/config/firebase'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { NationalEmblem } from '@/components/ui/national-emblem'
import { OtpInput } from './otp-input'
import { useSendOtpMutation, useVerifyOtpMutation } from '../../hooks/use-auth-mutations'

interface LoginFormProps {
  onSuccess?: () => void
}

// Helper function to convert Firebase errors to plain Vietnamese
const getErrorMessage = (error: string) => {
  const messages: Record<string, string> = {
    'auth/invalid-phone-number': 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng đợi 5 phút.',
    'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
    'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng nhấn "Gửi lại mã".',
    'auth/quota-exceeded': 'Hệ thống đang quá tải. Vui lòng thử lại sau.',
    'auth/captcha-check-failed': 'Xác thực bảo mật thất bại. Vui lòng thử lại.',
  }
  return messages[error] || 'Có lỗi xảy ra. Vui lòng thử lại.'
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<HTMLDivElement>(null)

  const sendOtpMutation = useSendOtpMutation()
  const verifyOtpMutation = useVerifyOtpMutation()

  const loading = sendOtpMutation.isPending || verifyOtpMutation.isPending
  const rawError = sendOtpMutation.error?.message || verifyOtpMutation.error?.message
  const error = rawError ? getErrorMessage(rawError) : null

  useEffect(() => {
    // Setup reCAPTCHA on mount
    if (recaptchaRef.current) {
      setupRecaptcha('recaptcha-container')
    }
  }, [])

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const verifier = setupRecaptcha('recaptcha-container')
      const result = await sendOtpMutation.mutateAsync({ phone, verifier })
      setConfirmationResult(result)
      setStep('otp')
    } catch (err) {
      console.error('Error sending OTP:', err)
      // Error is handled by mutation state
    }
  }

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault()
    if (!confirmationResult) return

    try {
      await verifyOtpMutation.mutateAsync({
        otp,
        confirmationResult,
        phone
      })
      onSuccess?.()
    } catch (err) {
      console.error('Error verifying OTP:', err)
      // Error is handled by mutation state
    }
  }

  const handleResendOTP = () => {
    setStep('phone')
    setOtp('')
    setConfirmationResult(null)
    sendOtpMutation.reset()
    verifyOtpMutation.reset()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-xl shadow-lg p-8 md:p-10">
        {/* National Emblem */}
        <div className="text-center mb-6">
          <NationalEmblem size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">
            UBND xã Diên Sanh
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Hệ thống quản lý xã
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-5 py-4 rounded-lg mb-6 text-base">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-lg font-medium mb-3 text-foreground">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                className={cn(
                  "w-full px-5 py-4 rounded-lg border bg-background text-lg",
                  "focus:outline-none focus:ring-4 focus:ring-gov-gold",
                  "placeholder:text-muted-foreground",
                  "min-h-[56px]"
                )}
                style={{ minHeight: 'var(--spacing-touch-lg)' }}
                required
                disabled={loading}
              />
              <p className="text-base text-muted-foreground mt-2">
                Nhập số điện thoại 10 chữ số (bắt đầu bằng 09, 08, 07, 05, 03)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className={cn(
                "w-full py-4 px-6 rounded-lg font-semibold relative text-lg",
                "bg-primary-600 text-white",
                "hover:bg-primary-700 transition-colors cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[56px]"
              )}
              style={{ minHeight: 'var(--spacing-touch-lg)' }}
            >
              <span className={loading ? 'opacity-0' : ''}>Nhận mã OTP</span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="sm" />
                </span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-lg font-medium mb-3 text-foreground">
                Mã xác thực OTP
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                error={!!error}
              />
              <p className="text-base text-muted-foreground mt-3 text-center">
                Mã OTP đã được gửi đến <strong>{phone}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={cn(
                "w-full py-4 px-6 rounded-lg font-semibold relative text-lg",
                "bg-primary-600 text-white",
                "hover:bg-primary-700 transition-colors cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[56px]"
              )}
              style={{ minHeight: 'var(--spacing-touch-lg)' }}
            >
              <span className={loading ? 'opacity-0' : ''}>Xác nhận</span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="sm" />
                </span>
              )}
            </button>

            {/* Resend options */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendOTP}
                className={cn(
                  "w-full text-base text-primary-600 hover:underline cursor-pointer",
                  "min-h-[48px] flex items-center justify-center"
                )}
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Gửi lại mã OTP
              </button>

              {/* Phone call alternative */}
              <div className="text-center">
                <p className="text-base text-muted-foreground mb-2">
                  Không nhận được mã?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // This would trigger a phone call OTP in a real implementation
                    alert('Tính năng gọi điện sẽ được triển khai sớm')
                  }}
                  className={cn(
                    "text-base text-gov-blue font-medium hover:underline cursor-pointer",
                    "min-h-[48px] flex items-center justify-center mx-auto"
                  )}
                  style={{ minHeight: 'var(--spacing-touch)' }}
                >
                  Gọi điện để nhận mã
                </button>
              </div>
            </div>
          </form>
        )}

        <div id="recaptcha-container" ref={recaptchaRef} />
      </div>
    </div>
  )
}
