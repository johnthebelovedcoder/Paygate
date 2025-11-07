# PayGate Frontend - Quick Reference Guide

## 🚀 Quick Start

### Path Aliases
```typescript
import Component from '@/components/Component';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { validators } from '@/utils/validation.utils';
```

---

## 🎨 Tailwind Utility Classes

### Buttons
```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-ghost">Ghost</button>
```

### Cards
```tsx
<div className="card">Basic Card</div>
<div className="card-hover">Hoverable Card</div>
```

### Inputs
```tsx
<input type="text" className="input" />
```

### Badges
```tsx
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-danger">Danger</span>
<span className="badge-primary">Primary</span>
```

### Colors
```tsx
className="bg-primary-600 text-white"
className="bg-success-100 text-success-800"
className="border-danger-500"
```

### Animations
```tsx
className="animate-in"           // Fade in
className="animate-slide-up"     // Slide up
className="animate-slide-down"   // Slide down
className="animate-pulse-slow"   // Slow pulse
```

---

## 🔐 Secure Storage

```typescript
import secureStorage from '@/utils/storage.utils';

// Token
secureStorage.setToken(token);
const token = secureStorage.getToken();
secureStorage.removeToken();

// Refresh Token
secureStorage.setRefreshToken(refreshToken);
const refreshToken = secureStorage.getRefreshToken();

// User
secureStorage.setUser(userData);
const user = secureStorage.getUser<UserType>();

// Clear all
secureStorage.clearAll();

// Check expiration
const isExpired = secureStorage.isTokenExpired(token);
```

---

## ✅ Validation

```typescript
import { validators, sanitize } from '@/utils/validation.utils';

// Email
if (!validators.email(email)) {
  setError('Invalid email');
}

// Password
const passwordCheck = validators.password(password);
if (!passwordCheck.valid) {
  setError(passwordCheck.errors.join(', '));
}

// URL
if (!validators.url(url)) {
  setError('Invalid URL');
}

// Phone
if (!validators.phone(phone)) {
  setError('Invalid phone number');
}

// Required
if (!validators.required(value)) {
  setError('This field is required');
}

// Length
if (!validators.minLength(value, 8)) {
  setError('Minimum 8 characters');
}

// Numeric
if (!validators.numeric(value)) {
  setError('Numbers only');
}

// Price
if (!validators.price(value)) {
  setError('Invalid price');
}

// Sanitize
const clean = sanitize.html(userInput);
```

---

## 🚨 Error Handling

```typescript
import errorHandler from '@/utils/error.utils';

try {
  await api.post('/endpoint', data);
} catch (error) {
  // Get user-friendly message
  const message = errorHandler.getUserMessage(error);
  toast.error(message);
  
  // Log with context
  errorHandler.log(error, 'Component.method');
  
  // Check error type
  if (errorHandler.isAuthError(error)) {
    // Handle auth error
  }
  
  if (errorHandler.isNetworkError(error)) {
    // Handle network error
  }
  
  if (errorHandler.isValidationError(error)) {
    // Handle validation error
  }
}
```

---

## 🌐 API Calls

```typescript
import { apiService } from '@/services/api';

// GET
const data = await apiService.get<ResponseType>('/endpoint');

// POST
const result = await apiService.post<ResponseType>('/endpoint', {
  key: 'value'
});

// PUT
const updated = await apiService.put<ResponseType>('/endpoint', {
  key: 'value'
});

// DELETE
await apiService.delete('/endpoint');
```

---

## 🎯 Component Template

```typescript
import { useState, useEffect, type ReactNode } from 'react';
import errorHandler from '@/utils/error.utils';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleAction = async () => {
    try {
      setLoading(true);
      // Action logic
    } catch (err) {
      const message = errorHandler.getUserMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

---

## 🎨 Color Palette

### Primary (Indigo)
- `primary-50` to `primary-950`
- Use for main actions, links, focus states

### Secondary (Slate)
- `secondary-50` to `secondary-950`
- Use for text, borders, backgrounds

### Success (Green)
- `success-50` to `success-900`
- Use for success messages, positive actions

### Warning (Amber)
- `warning-50` to `warning-900`
- Use for warnings, cautions

### Danger (Red)
- `danger-50` to `danger-900`
- Use for errors, destructive actions

---

## 📱 Responsive Design

```tsx
// Mobile first approach
<div className="
  w-full           // Mobile
  md:w-1/2         // Tablet
  lg:w-1/3         // Desktop
  xl:w-1/4         // Large desktop
">
  Content
</div>

// Hide/show based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

---

## 🌙 Dark Mode

```tsx
// Use dark: prefix for dark mode styles
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Content
</div>
```

---

## 🔄 Loading States

```tsx
// Spinner
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
</div>

// Skeleton
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
</div>
```

---

## 📝 Form Example

```tsx
import { useState } from 'react';
import { validators } from '@/utils/validation.utils';
import errorHandler from '@/utils/error.utils';

const MyForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!validators.email(email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordCheck = validators.password(password);
    if (!passwordCheck.valid) {
      newErrors.password = passwordCheck.errors[0] ?? 'Invalid password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      // Submit logic
    } catch (error) {
      const message = errorHandler.getUserMessage(error);
      setErrors({ form: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        {errors.email && (
          <p className="text-danger-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        {errors.password && (
          <p className="text-danger-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {errors.form && (
        <div className="bg-danger-50 border border-danger-200 rounded p-3">
          <p className="text-danger-800 text-sm">{errors.form}</p>
        </div>
      )}

      <button type="submit" className="btn-primary w-full">
        Submit
      </button>
    </form>
  );
};
```

---

## 🎯 Best Practices

### ✅ Do's
- Use path aliases (`@/`) for imports
- Use `secureStorage` for sensitive data
- Validate all user inputs
- Handle errors with `errorHandler`
- Use TypeScript types for everything
- Use semantic HTML elements
- Add ARIA labels for accessibility
- Use Tailwind utility classes
- Follow the component template structure

### ❌ Don'ts
- Don't import React unnecessarily
- Don't use `localStorage` for tokens
- Don't ignore TypeScript errors
- Don't use inline styles
- Don't skip error handling
- Don't forget loading states
- Don't ignore accessibility
- Don't create duplicate utilities

---

## 🔧 Common Patterns

### Conditional Rendering
```tsx
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}
{data && <DataDisplay data={data} />}
```

### List Rendering
```tsx
{items.map((item) => (
  <div key={item.id} className="card">
    {item.name}
  </div>
))}
```

### Conditional Classes
```tsx
<div className={`
  card
  ${isActive ? 'border-primary-500' : 'border-gray-200'}
  ${isDisabled && 'opacity-50 cursor-not-allowed'}
`}>
  Content
</div>
```

---

## 📚 Resources

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Last Updated:** 2024