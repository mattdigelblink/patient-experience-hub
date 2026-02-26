# Claude Code Development Rules

## UI Component Guidelines

### Rule 1: Always Check ui-tools Library First
**Before building any new UI component, ALWAYS check if it exists in `@blink-health/ui-tools` library.**

#### Available Components (Non-exhaustive):
- **BlinkBadge** - Chips/badges with delete functionality (`@blink-health/ui-tools/dist/esm/atoms/badge/BlinkBadge`)
- **BlinkTable, BlinkTableBody, BlinkTableCell, BlinkTableContainer, BlinkTableHead, BlinkTableRow** - Table components (`@blink-health/ui-tools/dist/esm/components/mui-combined/BlinkStyledTable`)
- **BlinkTextInput** - Text input fields (`@blink-health/ui-tools/dist/esm/inputs/text`)
- **BlinkDropdownSelect** - Dropdown select menus (`@blink-health/ui-tools/dist/esm/inputs/select/BlinkDropdownSelect`)

#### Import Pattern:
Always import from specific paths using the ESM dist:
```typescript
import { BlinkBadge } from '@blink-health/ui-tools/dist/esm/atoms/badge/BlinkBadge';
```

**Why specific imports?**
- Reduces bundle size
- Improves tree-shaking
- Minimizes compile time
- Prevents importing unused components

### Rule 2: Compile Time Optimization
**Any component usage from ui-tools must not significantly increase compile time.**

#### Guidelines:
1. **Use specific imports** instead of barrel imports
2. **Avoid importing entire component libraries** when only using 1-2 components
3. **Test compile time** after adding new ui-tools components
4. **Consider alternatives** if a ui-tools component causes >2 second compile time increase

#### Example - Good vs Bad:
```typescript
// ✅ GOOD - Specific import
import { BlinkBadge } from '@blink-health/ui-tools/dist/esm/atoms/badge/BlinkBadge';

// ❌ BAD - Barrel import (slow compile)
import { BlinkBadge } from '@blink-health/ui-tools';
```

### Rule 3: Component Discovery Process
When you need a UI component, follow this process:

1. **Check existing code** - Look at what's already imported in similar pages
2. **Search ui-tools** - Check the ui-tools library structure
3. **Use specific imports** - Import only what you need from specific paths
4. **Fall back to custom** - Only build custom components if ui-tools doesn't have it
5. **Keep it simple** - Custom components should be minimal and focused

### Rule 4: Styling Consistency
- Use ui-tools components with `sx` prop for customization
- Match existing styling patterns from other pages (e.g., Journey Search page)
- Color scheme should be consistent with Blink design system

## Performance Rules

### Compile Time Budget
- Initial page compilation: < 5 seconds acceptable
- Incremental updates: Should be near-instant with HMR
- If adding a component causes significant slowdown, reconsider the approach

### Hot Module Replacement (HMR)
- Always test that HMR works after adding new components
- If HMR breaks, investigate imports and dependencies
- Avoid patterns that disable Fast Refresh

## File Organization

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. UI component imports (ui-tools)
4. Local components
5. Types and utilities
6. Styles

### Example:
```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Dialog } from '@mui/material';
import { BlinkBadge } from '@blink-health/ui-tools/dist/esm/atoms/badge/BlinkBadge';
import { PageHeader } from '@/components/shared';
import { mockData } from '@/config/dummyData';
import type { MyType } from '@/types';
```

## Summary
**ALWAYS check ui-tools library before building new components. Use specific imports. Keep compile time minimal.**
