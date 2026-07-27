# AI Agent Development Guide

## Project Overview

**iQ Key Value Foundation UI Platform Admin** - A production-ready admin interface for the iQ Key Value platform, built with modern React tooling and Feature-Sliced Design (FSD) architecture.

**Key Characteristics:**

- Type-safe development with TypeScript strict configuration
- Feature-Sliced Design (FSD) architecture with strict layer boundaries
- Modern build tooling with Vite and SWC compiler
- Internationalization with Lingui (en-US and bg-BG locales)
- Comprehensive testing with Vitest (unit tests) and Playwright (E2E tests)
- Runtime configuration override support via `public/config.js`
- Session management with in-memory access tokens and sessionStorage-persisted refresh tokens
- Axios-based HTTP client with automatic token refresh interceptor

## Tech Stack

### Core Framework

- **React 19** - Modern React with concurrent features
- **TypeScript** - Strict type safety
- **Vite** - Lightning-fast development with HMR and optimized builds
- **PNPM** - Fast, disk space efficient package manager

### UI & Styling

- **Mantine UI v9** - Modern React components library with comprehensive theming
- **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Form, Hooks, Modals, Notifications, NProgress, Tiptap
- **Tabler Icons** - Beautiful SVG icons optimized for React
- **PostCSS** - CSS processing with Mantine preset
- **mantine-datatable** - Data table component

### Routing & State

- **TanStack Router v1** - Type-safe file-based routing with code splitting
- **TanStack Query v5** - Powerful data synchronization and caching
- **Zustand** - Lightweight client state management
- **nuqs** - Type-safe URL search params state management

### Data & API

- **Axios** - Promise-based HTTP client for API calls with interceptors
- **Zod** - Runtime type validation and schema parsing
- **Mantine Form** - Form state management with Zod integration
- **jwt-decode** - JWT token decoding
- **@dr.pogodin/react-helmet** - Document head management

### Development & Quality

- **Vitest** - Fast unit testing with coverage reports
- **Playwright** - Reliable end-to-end testing (Chromium, Firefox, WebKit)
- **Testing Library** - Simple and complete testing utilities for React
- **OxLint** - Ultra-fast linting with type-aware rules
- **OxFmt** - Fast opinionated code formatting
- **Stylelint** - CSS linting for consistent styling
- **Husky** - Git hooks for pre-commit validation
- **Commitlint** - Conventional commit message validation
- **Knip** - Dead code elimination and dependency analysis

### Internationalization & DevOps

- **Lingui v6** - Modern i18n framework with macro support and pluralization
- **Locales** - English (en-US) and Bulgarian (bg-BG) with PO-based catalogs
- **GitHub Actions** - CI/CD workflows for build, test, and PR validation
- **Dependabot** - Automated dependency updates and security monitoring
- **Release-it** - Automated versioning and changelog generation

## Architecture: Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design methodology with strict layer hierarchy and **automated architecture tests**.

### Project Structure

```
src/
├── app/                  # Application layer (providers, config, theme, main.tsx)
│   ├── config/          # Runtime env vars, app config
│   ├── app.tsx         # Root component
│   ├── theme.ts        # Mantine theme
│   └── index.ts
├── processes/           # Process layer (cross-feature business processes)
│   ├── inactivity-timer/
│   ├── session/         # Session store (Zustand)
│   └── theme/
├── pages/             # Page layer (route components)
│   ├── admin/         # Admin routes
│   ├── __root.tsx     # Root route
│   ├── index.tsx     # Home route
│   ├── sign-in.tsx
│   └── ...
├── widgets/           # Widget layer (complex UI blocks)
│   ├── dashboard-card-group/
│   ├── dashboard-recent-critical-audit/
│   ├── dashboard-recent-refunds/
│   ├── dashboard-stat-value/
│   ├── dashboard-sub-card/
│   ├── dashboard-subscription-breakdown/
│   ├── dashboard-suspended-tenants/
│   ├── dashboard-tenant-signup-chart/
│   └── index.ts
├── features/          # Feature layer (user scenarios, business logic)
│   ├── announcement-admin/
│   ├── ban-user/
│   ├── change-admin-password/
│   ├── edit-account/
│   ├── edit-tenant/
│   ├── edit-user/
│   ├── invitation-admin/
│   ├── manage-platform-authority/
│   ├── notification-bell/
│   ├── page-admin/
│   ├── plan-catalog/
│   ├── set-user-password/
│   ├── sign-in/
│   ├── sign-out/
│   ├── tenant-billing-settings/
│   └── unlock-user/
├── entities/          # Entity layer (business entities, data models)
│   ├── announcement/
│   ├── audit-record/
│   ├── cms-page/
│   ├── invitation/
│   ├── notification/
│   ├── oidc-identity/
│   ├── refund/
│   ├── subscription/
│   ├── tenant/
│   ├── user/
│   ├── webhook-log/
│   └── index.ts
├── shared/            # Shared layer (reusable code, UI kit, utilities)
│   ├── api/           # API client, auth interceptor
│   ├── lib/           # utilities, validation
│   ├── locales/
│   ├── mocks/
│   ├── types/
│   └── ui/            # shared UI components
├── architecture.test.ts  # Automated FSD compliance tests
├── main.tsx
└── ...
```

### FSD Layer Rules (CRITICAL - ENFORCED BY TESTS)

1. **Import Rule**: Higher layers can ONLY import from lower layers
   - ❌ `shared` cannot import from `features`
   - ✅ `features` can import from `shared` and `entities`
   - ✅ `processes` can import from `features`, `entities`, and `shared`

2. **Public API (MANDATORY)**: Each slice MUST expose functionality through `index.ts`
   - ✅ All imports must go through public API: `from "@/features/sign-in"`
   - ❌ Never import internal files: `from "@/features/sign-in/model/use-sign-in"`
   - **Architecture tests verify all slices have index.ts files**

3. **Cross-Feature Isolation**: Features cannot depend on each other
   - Use `shared` layer for common functionality
   - Use `processes` layer for cross-feature orchestration

4. **Segment Structure**: Each slice contains standardized segments

   ```
   feature-name/
   ├── ui/           # React components (REQUIRED - verified by tests)
   ├── model/        # Business logic, stores, types (REQUIRED - verified by tests)
   └── index.ts     # Public API exports (REQUIRED - verified by tests)
   ```

5. **Architecture Testing**: Run `pnpm test:arch` to verify FSD compliance

## AI Agent Development Guidelines

### Code Generation Principles

1. **Always Follow FSD Architecture**: Respect layer boundaries and public APIs
2. **Type-First Development**: Define TypeScript interfaces/types before implementation
3. **Component Composition**: Prefer composition over complex prop drilling
4. **Performance by Default**: Use React.memo, useMemo, useCallback appropriately
5. **Accessibility First**: Include ARIA attributes and semantic HTML
6. **Test-Driven Approach**: Generate tests alongside components

### Communication & Output Standards (CRITICAL)

**AI agents MUST communicate concisely and avoid unnecessary verbosity.**

#### Concise Output Requirements

1. **Be Direct**: Get to the point quickly without lengthy preambles
2. **Avoid Repetition**: Don't repeat information already stated
3. **Use Bullet Points**: For lists and multiple items
4. **Skip Obvious Statements**: Don't state what you're about to do if you're already doing it
5. **Minimal Summaries**: Keep task completion summaries to 2-3 sentences max
6. **No Fluff**: Avoid phrases like "I'll now proceed to...", "Let me...", "I'm going to..."

#### Examples

❌ **Verbose**:

```
I understand you want to add a logout button. Let me analyze the requirements
and create solution. I'll now proceed to create the necessary
files following the FSD architecture. First, I'll create the feature structure,
then implement the component, and finally add the necessary exports.
```

✅ **Concise**:

```
Adding logout button to navigation.

Files to create:
- features/logout-button/ui/logout-button.tsx
- features/logout-button/model/use-logout.ts
- features/logout-button/index.ts

Proceed?
```

❌ **Verbose Summary**:

```
I have successfully completed the task of adding the logout button feature.
The implementation includes:
- Created the logout button component with proper styling
- Implemented the logout mutation hook with error handling
- Added proper TypeScript types and interfaces
- Integrated with the authentication store
- Added internationalization support
- Exported through the public API as required by FSD

The feature is now ready to use and follows all project conventions.
```

✅ **Concise Summary**:

```
✓ Logout button added to navigation with auth integration and i18n support.
```

#### Prohibited: Auto-Generated Documentation Files

**NEVER automatically create summary or review markdown files unless explicitly requested by the user.**

❌ **Do NOT create**:

- `SUMMARY.md`
- `REVIEW.md`
- `CHANGES.md`
- `IMPLEMENTATION_NOTES.md`
- `TASK_SUMMARY.md`
- Any other documentation files summarizing your work

These files are:

- Wasteful and create noise in the repository
- Rarely useful to the user
- Not part of the project structure
- Redundant with git commit messages

✅ **Instead**:

- Provide a brief verbal summary (2-3 sentences)
- Generate a commit message (as per Commit Message Generation section)
- Answer specific questions if the user asks

#### Exception: User-Requested Documentation

Only create documentation files when:

- User explicitly requests: "Create a README for this feature"
- Project structure requires it: Adding to existing docs folder
- Part of the original task: "Add feature X with documentation"

#### Response Length Guidelines

- **Simple tasks**: 1-2 sentences + commit message
- **Medium tasks**: 3-5 sentences highlighting key changes
- **Complex tasks**: Brief summary + commit message + offer to explain details

#### When Presenting Changes for Approval

Keep proposals focused:

```markdown
## Proposed Changes

**Goal**: Add logout functionality

**Files**:

- features/logout-button/ (new)
- widgets/navigation/ui/navigation.tsx (modify)

**Key Changes**:

- Logout button with confirmation modal
- Auth store integration
- i18n support

Proceed?
```

Not this:

```markdown
## Comprehensive Analysis and Proposed Implementation Strategy

I have thoroughly analyzed your request to add logout functionality...
[3 paragraphs of explanation]

**Detailed Implementation Plan**:
[10 bullet points with sub-bullets]

**Architectural Considerations**:
[5 paragraphs about FSD]

**Risk Assessment**:
[Detailed analysis]

Would you like me to proceed with this carefully planned implementation?
```

### AI-Assisted Development Workflow

```typescript
// 1. Define types first
interface UserProfileProps {
  userId: string;
  onEdit?: (user: User) => void;
  variant?: "compact" | "detailed";
}

// 2. Create component with proper FSD location
// features/user-profile/ui/user-profile.tsx

// 3. Implement with Mantine components
// 4. Write unit tests
// 5. Export through public API
```

### Code Quality Checklist for AI

- [ ] TypeScript strict mode compliance
- [ ] Proper error boundaries and loading states
- [ ] Mantine theme integration
- [ ] Responsive design with Mantine breakpoints
- [ ] Internationalization with Lingui macros
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Performance optimizations (memoization)
- [ ] Unit tests co-located with source files
- [ ] Tests follow existing patterns (Vitest + React Testing Library)

## User Confirmation Policy & Decision Framework

### CRITICAL RULE: Always Ask Before Applying Changes

**AI agents MUST obtain explicit user approval before modifying any files, creating new files, or executing commands that alter the codebase.**

This policy ensures:

- User maintains full control over their codebase
- Changes are reviewed before application
- Unexpected modifications are prevented
- Learning opportunities through explanation

### Approval Workflow (MANDATORY)

```
1. ANALYZE    → Understand the user request and requirements
2. EXPLAIN    → Describe what changes will be made and why
3. ASSESS     → Evaluate impact, risks, and alternatives
4. PRESENT    → Show proposed changes with clear examples
5. WAIT       → ⚠️ STOP and wait for explicit user approval
6. APPLY      → Only after approval, make the changes
7. VERIFY     → Confirm changes work as expected
```

**NEVER skip step 5 (WAIT) for operations that modify the codebase.**

### Operations Requiring User Approval

The following operations ALWAYS require explicit user confirmation:

#### File System Operations

- ✋ Creating new files or directories
- ✋ Modifying existing files (any content changes)
- ✋ Deleting files or directories
- ✋ Moving or renaming files
- ✋ Changing file permissions

#### Code Changes

- ✋ Adding new features or components
- ✋ Refactoring existing code
- ✋ Fixing bugs or issues
- ✋ Updating dependencies or configurations
- ✋ Modifying build scripts or tooling
- ✋ Changing environment variables or configs

#### Architectural Changes

- ✋ Creating new FSD layers or slices
- ✋ Restructuring folder organization
- ✋ Adding new dependencies to package.json
- ✋ Modifying routing structure
- ✋ Changing state management patterns

#### Testing & Quality

- ✋ Adding or modifying tests
- ✋ Updating linting rules
- ✋ Changing formatting configuration
- ✋ Modifying CI/CD workflows

#### Commands with Side Effects

- ✋ Installing or removing packages
- ✋ Running database migrations
- ✋ Executing build or deployment commands
- ✋ Modifying git history or branches
- ✋ Running scripts that modify files

### Operations NOT Requiring Approval

These read-only operations can be performed without explicit approval:

#### Information Gathering

- ✅ Reading files to understand code structure
- ✅ Searching for patterns or specific code
- ✅ Listing directory contents
- ✅ Checking file diagnostics (errors, warnings)
- ✅ Analyzing dependencies or imports

#### Recommendations & Explanations

- ✅ Providing code examples or suggestions
- ✅ Explaining concepts or best practices
- ✅ Answering questions about the codebase
- ✅ Reviewing code and providing feedback
- ✅ Suggesting architectural improvements

#### Non-Destructive Analysis

- ✅ Running type checks (read-only)
- ✅ Analyzing test coverage reports
- ✅ Checking code quality metrics
- ✅ Reviewing git history or diffs

### How to Present Changes for Approval

When proposing changes, use this format:

```markdown
## Proposed Changes

**Goal**: Brief description of what we're trying to achieve

**Impact**: What will change and why

**Files Affected**:

- `path/to/file1.ts` - What changes
- `path/to/file2.tsx` - What changes
- `path/to/new-file.ts` - New file, purpose

**Changes Preview**:
Show key code snippets or file structure

**Risks & Considerations**:

- Any potential issues or breaking changes
- Dependencies or related changes needed

**Alternatives Considered**:

- Other approaches and why this one is better

**Testing Plan**:

- How to verify the changes work

---

**Ready to proceed?** Please confirm and I'll apply these changes.
```

### User Approval Phrases

The AI should wait for clear approval phrases such as:

- "Yes, go ahead"
- "Proceed"
- "Apply the changes"
- "Make the changes"
- "Do it"
- "Looks good"
- "Approved"

### Handling User Feedback

If the user provides feedback instead of approval:

- **"Change X to Y"** → Update the proposal and present again
- **"What about Z?"** → Address the question, then re-present
- **"No" or "Cancel"** → Acknowledge and ask what they'd like instead
- **"Show me more"** → Provide additional details or examples

### Multi-Step Changes

For complex changes involving multiple files or steps:

1. **Break down into logical phases**
   - Phase 1: Core functionality
   - Phase 2: UI components
   - Phase 3: Tests and documentation

2. **Get approval for each phase** (or all phases upfront)

3. **Apply incrementally** and verify after each phase

4. **Stop if issues arise** and report back to user

### Exception: Emergency Fixes

In rare cases where the user explicitly requests immediate action:

- "Just fix it"
- "Do whatever is needed"
- "I trust you, go ahead"

Even then, provide a summary of what was changed after completion.

### Decision Framework Examples

#### Example 1: Adding a New Feature

```
❌ WRONG:
User: "Add a logout button"
AI: [Immediately creates files and modifies code]

✅ CORRECT:
User: "Add a logout button"
AI: "I'll add a logout button to the navigation. Here's my plan:

**Changes**:
1. Create `features/logout-button/` with FSD structure
2. Add logout mutation using use-form-mutation
3. Integrate into navigation widget
4. Add i18n translations

**Files to create**:
- features/logout-button/ui/logout-button.tsx
- features/logout-button/model/use-logout.ts
- features/logout-button/index.ts

**Files to modify**:
- widgets/navigation/ui/navigation.tsx (add button)
- locales/en/messages.po (add translations)

Would you like me to proceed with this implementation?"
```

#### Example 2: Fixing a Bug

````
❌ WRONG:
User: "The form validation isn't working"
AI: [Reads code, identifies issue, immediately fixes it]

✅ CORRECT:
User: "The form validation isn't working"
AI: [Reads code and analyzes]
"I found the issue. The form is missing the Zod schema in the useForm hook.

**Problem**:
The form in `features/sign-in/ui/sign-in-form.tsx`
is using useMantineForm directly instead of our validateWithZod helper.

**Solution**:
Use validateWithZod helper to validate form values with Zod.

**Change**:
```tsx
// Before
const form = useMantineForm({ initialValues });

// After
const form = useMantineForm({
  initialValues,
  validate: (values) => validateWithZod(buildSignInSchema(), values),
});
````

This will enable Zod validation. Should I apply this fix?"

```

#### Example 3: Information Request (No Approval Needed)

```

✅ CORRECT:
User: "How does the error handling work?"
AI: [Reads relevant files and explains]
"The project uses Axios interceptors in shared/api/auth-interceptor.ts to handle:

- Attaching access tokens to requests
- Refreshing tokens automatically when receiving a 401
- Clearing session and redirecting to login on auth errors

Session management is handled in processes/session/session.store.ts.

Would you like me to show you how to implement this in a specific feature?"

````

### Verification After Changes

After applying approved changes:

1. **Run diagnostics** to check for errors
2. **Verify architecture compliance** (if FSD changes)
3. **Report results** concisely (2-3 sentences max)
4. **Generate commit message** (for complex tasks, see Commit Message Generation)
5. **Suggest next steps** (if relevant, keep brief)

**Important**: Do NOT create summary markdown files. Provide verbal summary only.

### Summary

**The golden rule**: When in doubt, ask for approval. It's better to ask unnecessarily than to make unwanted changes.

**Remember**: Users appreciate transparency and control. Always explain your reasoning and wait for confirmation before modifying their codebase.

## Development Guidelines

### Component Development Standards

1. **Mantine Components First**: Use Mantine UI components as building blocks
2. **Type-First Development**: Define TypeScript interfaces/types for all props
3. **Component Naming**: PascalCase, file name matches component name (kebab-case)
4. **Feature-Sliced Structure**: Organize by features, not by file types
5. **Lingui Integration**: Use `t` macro for labels and `useLingui()._()` for runtime translation

### Form Handling Standards

The project uses Mantine Form with Zod validation via `validateWithZod` helper from `@/shared/lib/zod-form-validation`.

**Example (from features/sign-in):**

```tsx
// features/sign-in/model/use-sign-in.ts
import { useForm } from "@mantine/form";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

function buildSignInSchema() {
  return z.object({
    email: z.string().min(1, t`Email is required`).email(t`Please enter a valid email address`),
    password: z.string().min(1, t`Password is required`),
  });
}

type SignInFormValues = z.infer<ReturnType<typeof buildSignInSchema>>;

export function useSignIn() {
  const form = useForm<SignInFormValues>({
    initialValues: { email: "", password: "" },
    validate: (values) => validateWithZod(buildSignInSchema(), values),
  });

  const onSubmit = async (values: SignInFormValues) => {
    // Handle submission
  };

  return { form, onSubmit };
}
````

### Session Management

Session state is managed via Zustand store in `processes/session/`:

- **accessToken**: Stored in memory (cleared on page reload)
- **refreshToken**: Stored in sessionStorage (persists across page reloads, cleared on tab close)

```tsx
// Import and use session store from processes/session
import { useSessionStore, setTokens, clearSession, getAccessToken } from "@/processes/session";
```

### API Service Standards

The project uses Axios client from `@/shared/api/http-client`:

- **Dev mode**: Requests go through Vite proxy at `/api`
- **Production**: Uses `VITE_API_SERVER_URL` from runtime config
- **Interceptors**: Handle token attachment and silent refresh (see `auth-interceptor.ts`)

**Example API Service (auth.ts):**

```tsx
import { httpClient } from "./http-client";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  signIn: (body: SignInRequest): Promise<SignInResponse> =>
    httpClient.post<SignInResponse>("/v1/iam/auth/admin/sign-in", body).then((r) => r.data),
  signOut: (): Promise<void> => httpClient.post("/v1/iam/auth/sign-out").then(() => undefined),
};
```

### Environment Variables and Configuration

Environment variables are managed in `app/config/runtime-env.ts`:

```tsx
import { getConfig, isDemoMode, appTitle } from "@/app/config/runtime-env";
```

Available config keys:

- `VITE_API_SERVER_URL`: Backend API URL (required for production)
- `VITE_LOG_LEVEL`: Logging level
- `VITE_DEMO_MODE`: Demo mode flag
- `VITE_APP_TITLE`: Application title

Runtime config can be overridden via `public/config.js` without rebuilding.

### Development Scripts

```bash
# Development
pnpm dev                    # Start development server (http://localhost:5173)
pnpm build                  # Build for production (includes i18n compile)
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run unit tests with Vitest
pnpm test:coverage         # Run tests with coverage report
pnpm test:ui               # Run tests with UI interface
pnpm test:arch             # Run FSD architecture boundary tests
pnpm e2e                   # Run E2E tests with Playwright
pnpm e2e:ui                # Run E2E tests with UI interface
pnpm e2e:headed            # Run E2E tests in headed mode
pnpm e2e:smoke             # Run smoke tests on Chromium
pnpm playwright:install    # Install Playwright browsers (first time)

# Code Quality
pnpm lint                  # Run OxLint (type-aware)
pnpm lint:fix              # Fix linting issues and format
pnpm formatter:check       # Check code formatting with OxFmt
pnpm formatter:write       # Format code with OxFmt
pnpm type-check            # TypeScript type checking
pnpm knip                  # Detect unused exports and dependencies

# Internationalization
pnpm messages:extract      # Extract translation messages from source
pnpm messages:compile      # Compile PO catalogs to TypeScript

# Maintenance
pnpm cleanup               # Remove dist, .tanstack, coverage, caches
pnpm cleanup:all           # Full cleanup including node_modules
```

## Testing Strategy

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Vitest coverage with v8

### Test Co-location Pattern (CRITICAL)

**Tests MUST be co-located with their source files** following FSD architecture:

```
src/
├── features/
│   └── sign-in/
│       └── ui/
│           ├── sign-in-form.tsx
│           └── sign-in-form.test.tsx  ← Test alongside component
├── processes/
│   └── session/
│       └── session.store.ts
│       └── session.store.test.ts  ← Test alongside store
└── ...
```

**Benefits:**

- ✅ Tests are easier to find and maintain
- ✅ Changes to components naturally prompt test updates
- ✅ Clear 1:1 relationship between code and tests
- ✅ Follows FSD principles of feature isolation
- ✅ Reduces cognitive load when working on features

**Naming Convention:**

- Component: `component-name.tsx`
- Test: `component-name.test.tsx`
- Store: `store-name.ts`
- Test: `store-name.test.ts`

**When Creating Tests:**

1. Place test file in the same directory as the source file
2. Use `.test.tsx` for component tests
3. Use `.test.ts` for logic/store tests
4. Follow existing test patterns in the project

## Internationalization with Lingui

### Translation Patterns

```tsx
// Use t macro for static strings (compile-time)
import { t } from "@lingui/core/macro";

<TextInput label={t`Email`} placeholder={t`you@example.com`} />;

// Use Trans for JSX with interpolation
import { Trans } from "@lingui/core/macro";

<h1>
  <Trans>Welcome!</Trans>
</h1>;

// Use useLingui for runtime translations
import { useLingui } from "@lingui/react";

const { _ } = useLingui();
const dynamicMessage = _(t`Dynamic message`);
```

### Message Extraction and Compilation

```bash
# Extract messages from source code
pnpm messages:extract

# Compile messages for production
pnpm messages:compile
```

### Supported Locales

- en-US (English)
- bg-BG (Bulgarian)
