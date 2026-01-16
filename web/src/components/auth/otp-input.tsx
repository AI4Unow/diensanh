import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  length?: number
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  error = false,
  length = 6
}: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow single digit
    const digit = inputValue.slice(-1)
    if (digit && !/^\d$/.test(digit)) return

    // Update value
    const newValue = value.split('')
    newValue[index] = digit
    const updatedValue = newValue.join('').slice(0, length)
    onChange(updatedValue)

    // Auto-focus next input if digit entered
    if (digit && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
        setFocusedIndex(index + 1)
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      // If current input is empty, move to previous
      if (!value[index] && index > 0) {
        const prevInput = inputRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
          setFocusedIndex(index - 1)
        }
      }
      // Clear current digit
      const newValue = value.split('')
      newValue[index] = ''
      onChange(newValue.join(''))
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)

    if (digits) {
      onChange(digits)
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(digits.length, length - 1)
      const targetInput = inputRefs.current[nextIndex]
      if (targetInput) {
        targetInput.focus()
        setFocusedIndex(nextIndex)
      }
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-background',
            'focus:outline-none focus:ring-4 focus:ring-gov-gold transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-destructive text-destructive'
              : focusedIndex === index
                ? 'border-primary-500'
                : 'border-border hover:border-primary-300'
          )}
          style={{
            minHeight: 'var(--spacing-touch-lg)',
            minWidth: 'var(--spacing-touch-lg)'
          }}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}