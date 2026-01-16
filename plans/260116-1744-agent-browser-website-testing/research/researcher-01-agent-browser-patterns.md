# Agent-Browser CLI Testing Patterns

Research report on agent-browser CLI tool for automated website testing.

## 1. Core Workflow Pattern

**Standard Flow:** `open → snapshot → interact → verify`

```bash
# Initialize session
npx agent-browser open https://example.com

# Capture page state with interactive element refs
npx agent-browser snapshot -i

# Interact using @refs
npx agent-browser click @e5
npx agent-browser fill @e3 "test@example.com"
npx agent-browser hover @e10

# Verify state
npx agent-browser snapshot
```

**Key Insight:** Snapshot-first approach creates stable element map before interactions.

## 2. @ref Reference System

**Mechanism:**
- `snapshot -i` assigns unique `[ref=eN]` attributes to DOM elements
- Use `@` prefix for targeting: `@e1`, `@e2`, etc.
- Refs stable within snapshot context, reduces selector flakiness

**Why @refs > CSS/XPath:**
- Survives dynamic class changes
- No deep nesting issues
- AI-friendly simplified page "map"

**Example:**
```bash
npx agent-browser snapshot -i  # Generates refs
npx agent-browser click @e12   # Click login button
npx agent-browser fill @e7 "password123"
```

## 3. Session Management & Isolation

**Isolation Patterns:**
- Each session maintains isolated cookies, localStorage, auth state
- Prevents test interference
- Similar to Playwright's BrowserContexts

**Session Persistence:**
```bash
# Save auth state after login
npx agent-browser snapshot --save-state auth.json

# Restore in new session
npx agent-browser open https://app.example.com --state auth.json
```

**Best Practice:** Use separate sessions per test case, avoid state leakage.

## 4. Screenshot/PDF Capture

**Visual Evidence:**
```bash
# Full page screenshot
npx agent-browser screenshot output.png

# Element-specific capture
npx agent-browser screenshot @e5 element.png

# PDF generation
npx agent-browser pdf report.pdf
```

**Use Cases:**
- Test failure debugging
- Visual regression testing
- Compliance documentation
- AI agent feedback loop

**Security Note:** Screenshots may contain sensitive data - encrypt/restrict access.

## 5. Network Mocking & Interception

**Commands:**
```bash
# Intercept API calls
npx agent-browser network route "**/api/users" --body '{"users":[]}'

# Simulate errors
npx agent-browser network route "**/api/checkout" --abort

# Verify requests
npx agent-browser network requests

# Clear rules
npx agent-browser network unroute
```

**Benefits:**
- Deterministic tests (no API flakiness)
- Fast execution (no network latency)
- Edge case coverage (errors, empty states)
- Offline testing

## 6. Common Testing Scenarios

### Form Testing
```bash
# Intelligent field detection
npx agent-browser snapshot -i
npx agent-browser fill @e3 "john@example.com"  # Email field
npx agent-browser fill @e4 "John Doe"          # Name field
npx agent-browser click @e9                    # Submit
npx agent-browser snapshot                     # Verify success
```

### Authentication Flows
```bash
# Login sequence
npx agent-browser open https://app.com/login
npx agent-browser snapshot -i
npx agent-browser fill @e1 "user@example.com"
npx agent-browser fill @e2 "password"
npx agent-browser click @e3
npx agent-browser snapshot --save-state auth.json
```

**MFA Handling:** Use env vars for OTP or integrate OTP APIs.

### Navigation Testing
```bash
# AI pathfinding approach
npx agent-browser open https://site.com
npx agent-browser snapshot -i
npx agent-browser click @e15  # Navigate to products
npx agent-browser snapshot -i
npx agent-browser click @e22  # Select item
npx agent-browser screenshot verification.png
```

## Key Insights

1. **@refs = Stability** - Avoid brittle selectors, use snapshot refs
2. **Session Isolation** - One session per test prevents state pollution
3. **Network Control** - Mock APIs for deterministic, fast tests
4. **Visual Evidence** - Screenshots critical for debugging AI agents
5. **Auth Optimization** - Save/restore state to skip repetitive logins

## Integration Best Practices

- Add `data-testid` attributes for better AI/agent detection
- Use staging environments for auth testing (avoid prod security alerts)
- Integrate in CI/CD pipelines for PR validation
- Combine with Playwright for programmatic control

## Unresolved Questions

- Session cleanup strategy for long-running test suites?
- Performance impact of snapshot -i on large SPAs?
- Best pattern for testing websocket interactions?
- Integration with existing Playwright/Cypress test suites?

---
**Sources:**
- [agent-browser GitHub](https://github.com/browserbase/agent-browser)
- [Playwright Browser Contexts](https://playwright.dev/docs/browser-contexts)
- [Browserbase Agent Implementation](https://www.browserbase.com/)
