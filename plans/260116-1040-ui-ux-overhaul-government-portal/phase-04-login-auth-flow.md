# Phase 4: Login & Authentication Flow

## Context Links
- [Plan Overview](./plan.md)
- [Phase 3: Portal Homepage](./phase-03-portal-homepage-redesign.md)
- [Current Login Form](../../web/src/components/auth/login-form.tsx)
- [Current Login Page](../../web/src/pages/login.tsx)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 2h
- **Description:** Improve login UX for elderly users with larger inputs, clearer labels, and official branding

## Key Insights
- Current form is functional but lacks government branding
- Phone input needs clearer formatting guidance
- OTP input could be larger and easier to read
- Error messages should use plain Vietnamese
- Consider optional phone call verification for accessibility

## Requirements

### Functional
- Add National Emblem to login page
- Increase input size to 56px height
- Add phone number formatting guidance
- Improve OTP input readability (larger, spaced digits)
- Clearer error messages in plain Vietnamese
- Add "Call me instead" option for OTP

### Non-Functional
- Touch targets: 56px for all inputs and buttons
- Font size: 18px for inputs, 20px for labels
- High contrast error states
- Works on budget Android devices

## Architecture

### Component Structure
```
auth/
├── login-form.tsx          # Modify - enlarge inputs, add branding
├── otp-input.tsx           # New - individual digit boxes
├── login-page.tsx          # Modify - add emblem, background
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/components/auth/login-form.tsx` | Larger inputs, emblem, better spacing |
| `web/src/pages/login.tsx` | Government background, branding |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/components/auth/otp-input.tsx` | Individual digit OTP input component |

## Implementation Steps

### 1. Create OTP Input Component
```tsx
// web/src/components/auth/otp-input.tsx
// Features:
// - 6 individual boxes for digits
// - 56px x 56px each box
// - Auto-focus next on input
// - Auto-submit when complete
// - Backspace navigates back
// - 32px font size for visibility
// - High contrast border on focus

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  // 6 refs for individual inputs
  // Handle paste for full OTP
  // Visual focus indicator
}
```

### 2. Update Login Form
```tsx
// Changes to login-form.tsx:

// Add emblem at top
<NationalEmblem className="w-16 h-16 mx-auto mb-4" />

// Increase card padding
<div className="bg-card rounded-xl shadow-lg p-8 md:p-10">

// Larger phone input
<input
  className="w-full px-5 py-4 rounded-lg border text-lg min-h-[56px]"
  placeholder="Ví dụ: 0912 345 678"
/>

// Add formatting hint
<p className="text-sm text-muted-foreground mt-2">
  Nhập số điện thoại 10 chữ số
</p>

// Replace OTP input with new component
<OtpInput
  value={otp}
  onChange={setOtp}
  disabled={loading}
  error={!!error}
/>

// Larger submit button
<button className="min-h-[56px] text-lg font-semibold">
```

### 3. Improve Error Messages
```tsx
const getErrorMessage = (error: string) => {
  // Map Firebase errors to plain Vietnamese
  const messages: Record<string, string> = {
    'auth/invalid-phone-number': 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng đợi 5 phút.',
    'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
    'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng nhấn "Gửi lại mã".',
  }
  return messages[error] || 'Có lỗi xảy ra. Vui lòng thử lại.'
}
```

### 4. Update Login Page Background
```tsx
// web/src/pages/login.tsx
export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-b from-gov-blue-light to-white p-4">
      {/* Optional: subtle emblem watermark in background */}
      <LoginForm onSuccess={handleSuccess} />
    </div>
  )
}
```

### 5. Add Phone Call Alternative
```tsx
// After OTP sent, offer call option
<div className="mt-4 text-center">
  <p className="text-sm text-muted-foreground">
    Không nhận được mã?
  </p>
  <button
    onClick={handleResendAsCall}
    className="text-gov-blue font-medium min-h-[48px]"
  >
    Gọi điện để nhận mã
  </button>
</div>
```

## Todo List

- [ ] Create otp-input.tsx with 6 individual digit boxes
- [ ] Update login-form.tsx with larger inputs (56px)
- [ ] Add National Emblem to login form
- [ ] Increase font sizes (18px inputs, 20px labels)
- [ ] Add phone number format hint
- [ ] Improve error messages to plain Vietnamese
- [ ] Add "Gọi điện để nhận mã" option
- [ ] Update login.tsx with government background
- [ ] Ensure all touch targets >= 56px
- [ ] Test OTP input on mobile
- [ ] Verify focus states visible
- [ ] Run build and verify

## Success Criteria
- [ ] Login form shows National Emblem
- [ ] All inputs are 56px height
- [ ] OTP digits are clearly separated and large
- [ ] Error messages in plain Vietnamese
- [ ] Phone call option available
- [ ] Works on budget Android (test on emulator)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| OTP auto-focus fails on some browsers | Medium | Fallback to single input |
| Phone call API not available | Low | Graceful fallback to SMS |
| reCAPTCHA visibility on mobile | Medium | Position below fold |

## Security Considerations
- Rate limiting on OTP requests (already implemented)
- Phone number validation server-side
- OTP expiration messaging

## Next Steps
- After completion, proceed to [Phase 5: Admin Dashboard](./phase-05-admin-dashboard.md)
