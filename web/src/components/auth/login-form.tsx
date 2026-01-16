import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { ConfirmationResult } from 'firebase/auth'
import { setupRecaptcha } from '@/config/firebase'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { useSendOtpMutation, useVerifyOtpMutation } from '../../hooks/use-auth-mutations'

interface LoginFormProps {
  onSuccess?: () => void
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
  const error = sendOtpMutation.error?.message || verifyOtpMutation.error?.message

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
      <div className="bg-card rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            UBND xã Diên Sanh
          </h1>
          <p className="text-muted-foreground mt-2">
            Hệ thống quản lý xã
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500",
                  "placeholder:text-muted-foreground",
                  "min-h-[48px]"
                )}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium relative",
                "bg-primary-600 text-white",
                "hover:bg-primary-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[48px]"
              )}
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
              <label htmlFor="otp" className="block text-sm font-medium mb-2">
                Mã xác thực OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-background text-center text-2xl tracking-widest",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500",
                  "min-h-[48px]"
                )}
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-sm text-muted-foreground mt-2">
                Mã OTP đã được gửi đến {phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium relative",
                "bg-primary-600 text-white",
                "hover:bg-primary-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[48px]"
              )}
            >
              <span className={loading ? 'opacity-0' : ''}>Xác nhận</span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="sm" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              className={cn(
                "w-full text-sm text-primary-600 hover:underline",
                "min-h-[48px] flex items-center justify-center"
              )}
            >
              Gửi lại mã OTP
            </button>
          </form>
        )}

        <div id="recaptcha-container" ref={recaptchaRef} />
      </div>
    </div>
  )
}
