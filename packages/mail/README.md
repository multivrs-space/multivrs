# @multivrs/mail

The official high-performance email SDK for the [Multivrs Platform](https://multivrs.space) — purpose-built for **swift-rust**, Next.js, Bun, and modern edge runtimes.

Fast, reliable transactional email delivery with sub-50ms API dispatch, two-way mailbox routing, scheduled delivery, attachments, and built-in delivery analytics.

Designed as a **1:1 drop-in replacement for Resend** — migrate in seconds with zero code refactoring.

---

## ⚡ Flagship Support: `swift-rust`

`@multivrs/mail` is engineered from the ground up to integrate seamlessly into **`swift-rust`** applications:
- **Server Route Handlers**: Send emails directly from `swift-rust` SSR endpoints and API routes.
- **TSX Server Actions**: Trigger transactional emails inside full-stack TSX action dispatches.
- **Edge Runtimes**: Zero Node-only dependencies; runs in V8 isolate edge workers, Bun, and Rust-hosted WebAssembly environments.

---

## 📦 Compatible Frameworks & Runtimes

1. **`swift-rust`** 🦀 (Flagship — native SSR routes, server actions, background workers)
2. **Next.js** (App Router Server Actions, Route Handlers, Pages API)
3. **Bun** (Native edge runtime & HTTP servers)
4. **Cloudflare Workers & V8 Isolates**
5. **Node.js** (v18+)
6. **React & React Email** (author responsive email templates with JSX/TSX components)
7. **Express, Hono, Fastify** (Node / Bun microservices)
8. **REST API & SMTP Relay** (universal compatibility with Python, PHP, Laravel, Go, Rust, Java, Ruby, .NET)

---

## 📥 Installation

```bash
# bun (recommended)
bun add @multivrs/mail

# npm
npm install @multivrs/mail

# pnpm
pnpm add @multivrs/mail

# yarn
yarn add @multivrs/mail
```

---

## 🏎️ Quickstart

### 1. swift-rust Application (Recommended)

In your `swift-rust` server route handler or action:

```typescript
import { MultivrsMail } from "@multivrs/mail";

const mail = new MultivrsMail();

const { data, error } = await mail.emails.send({
  from: "onboarding@yourdomain.com",
  to: "user@example.com",
  subject: "Hello World",
  html: "<p>Congrats on sending your first email with Multivrs Mail!</p>",
});
```

### 2. Next.js / Node.js / Bun

```typescript
import { MultivrsMail } from "@multivrs/mail";

const mail = new MultivrsMail(process.env.MULTIVRS_API_KEY);

const { data, error } = await mail.emails.send({
  from: "onboarding@yourdomain.com",
  to: "user@example.com",
  subject: "Hello World",
  html: "<p>Congrats on sending your first email with Multivrs Mail!</p>",
});
```

---

## 🔄 Resend 1:1 Drop-in Replacement

If your existing codebase uses `resend` or `@resend/node`, migrate by updating your import statement with zero refactoring:

```typescript
// Simply replace: import { Resend } from "resend";
import { Resend } from "@multivrs/mail";

const resend = new Resend(process.env.MULTIVRS_API_KEY);

const { data, error } = await resend.emails.send({
  from: "onboarding@yourdomain.com",
  to: "developer@example.com",
  subject: "Hello World",
  html: "<p>Congrats on sending your first email with Multivrs Mail!</p>",
});
```

---

## 🛠️ Advanced Features

### Scheduled Sending
Schedule emails to be dispatched at a precise future timestamp:
```typescript
await mail.emails.send({
  from: "billing@yourdomain.com",
  to: "user@example.com",
  subject: "Your Subscription Renews Tomorrow",
  html: "<p>Friendly reminder that your plan renews in 24 hours.</p>",
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
});
```

### File Attachments
Send PDFs, invoices, and documents via Buffer, Uint8Array, or Base64:
```typescript
await mail.emails.send({
  from: "invoices@yourdomain.com",
  to: "accounting@client.com",
  subject: "Invoice #1042",
  html: "<p>Your invoice is attached.</p>",
  attachments: [
    {
      filename: "invoice-1042.pdf",
      content: invoiceBuffer,
      contentType: "application/pdf",
    },
  ],
});
```

### Multiple Recipients & Custom Mailbox Routing
```typescript
await mail.emails.send({
  from: "team@yourdomain.com",
  to: ["dev1@team.com", "dev2@team.com"],
  cc: ["lead@team.com"],
  bcc: ["compliance@team.com"],
  replyTo: ["support@yourdomain.com"],
  mailboxId: "mbx_prod_support",
  subject: "Deployment Alert",
  text: "Deployment succeeded.",
});
```

---

## 🌐 Documentation & Resources

- **Website**: [multivrs.space](https://multivrs.space)
- **Documentation**: [multivrs.space/docs/mail](https://multivrs.space/docs/mail)
- **Dashboard**: [multivrs.space/dashboard](https://multivrs.space/dashboard)

---

## License

MIT © [Multivrs](https://multivrs.space)
