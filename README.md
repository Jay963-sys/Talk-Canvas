This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
talk-canvas
├─ AGENTS.md
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ LogoutButton.tsx
│  │  ├─ orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ originals
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ cloudinary
│  │  │  │  └─ sign
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ originals
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ cloudinary
│  │  │  └─ sign
│  │  │     └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ custom-order
│  │  │  └─ route.ts
│  │  ├─ enquiry
│  │  │  └─ route.ts
│  │  ├─ orders
│  │  │  └─ route.ts
│  │  └─ paystack
│  │     ├─ verify
│  │     │  └─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ checkout
│  │  ├─ page.tsx
│  │  └─ success
│  │     ├─ page.tsx
│  │     └─ SuccessView.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.svg
│  ├─ layout.tsx
│  ├─ originals
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ page.tsx
│  └─ prints
│     ├─ custom
│     │  └─ page.tsx
│     └─ page.tsx
├─ CLAUDE.md
├─ components
│  ├─ admin
│  │  ├─ AdminNav.tsx
│  │  ├─ DeleteButton.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ OrderStatusBadge.tsx
│  │  ├─ OrderStatusSelect.tsx
│  │  ├─ OriginalForm.tsx
│  │  └─ VisibilityToggle.tsx
│  ├─ cart
│  │  └─ CartDrawer.tsx
│  ├─ contact
│  │  └─ ContactForm.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ originals
│  │  ├─ EnquireButton.tsx
│  │  ├─ EnquiryModal.tsx
│  │  ├─ OriginalActions.tsx
│  │  └─ OriginalARModal.tsx
│  ├─ prints
│  │  ├─ ARModal.tsx
│  │  ├─ ARViewer.tsx
│  │  ├─ Configurator.tsx
│  │  ├─ CustomOrderForm.tsx
│  │  ├─ FramedPreview.tsx
│  │  ├─ StepFrame.tsx
│  │  ├─ Stepper.tsx
│  │  ├─ StepReview.tsx
│  │  ├─ StepSize.tsx
│  │  ├─ StepUpload.tsx
│  │  └─ Summary.tsx
│  └─ WorkCard.tsx
├─ data
│  ├─ contact.ts
│  ├─ frames.ts
│  ├─ originals.ts
│  ├─ pricing.ts
│  ├─ shipping.ts
│  └─ sizes.ts
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ lib
│  ├─ auth-server.ts
│  ├─ auth.ts
│  ├─ cartStore.ts
│  ├─ constants.ts
│  ├─ db
│  │  ├─ index.ts
│  │  ├─ queries
│  │  │  ├─ orders.ts
│  │  │  └─ originals.ts
│  │  └─ schema.ts
│  ├─ email
│  │  ├─ index.ts
│  │  ├─ styles.ts
│  │  └─ templates
│  │     ├─ ContactMessage.tsx
│  │     ├─ CustomOrderNotification.tsx
│  │     ├─ EnquiryNotification.tsx
│  │     ├─ OrderConfirmation.tsx
│  │     └─ OrderNotification.tsx
│  ├─ frameModel.ts
│  ├─ frameUSDZ.ts
│  ├─ orders
│  │  └─ fulfillment.ts
│  ├─ originalDisplay.ts
│  ├─ paystack.ts
│  ├─ store.ts
│  ├─ upload.ts
│  └─ utils.ts
├─ LICENSE
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ frames
│  │  ├─ antique-black.jpg
│  │  ├─ antique-gold.jpg
│  │  ├─ regular-box-black.jpg
│  │  ├─ regular-box-brown.jpg
│  │  ├─ regular-box-gold.jpg
│  │  ├─ regular-box-white.jpg
│  │  ├─ regular-floating-black.jpg
│  │  ├─ regular-floating-brown.jpg
│  │  ├─ regular-floating-gold.jpg
│  │  └─ regular-floating-white.jpg
│  ├─ home
│  │  ├─ 1.jpg
│  │  ├─ 2.jpg
│  │  ├─ 3.jpg
│  │  ├─ 4.jpg
│  │  ├─ 701056196_18317350042279627_2981594976990571114_n.jpg
│  │  ├─ 701157189_18317637556279627_1141008268171820547_n.jpg
│  │  ├─ 701470636_18317350015279627_938129702075256091_n.jpg
│  │  ├─ 701480522_18317350024279627_7932182608816352102_n.jpg
│  │  ├─ 702651794_18317637586279627_7339476542703575625_n.jpg
│  │  ├─ 702696504_18317771173279627_7276012545033299743_n.jpg
│  │  ├─ 702729662_18317637640279627_8460142114219651625_n.jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n (1).jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n.jpg
│  │  ├─ 703055701_18317908519279627_7673709464511402851_n.jpg
│  │  ├─ 703988595_18317908561279627_2950059821325476066_n.jpg
│  │  ├─ a.jpg
│  │  ├─ b.jpg
│  │  ├─ c.jpg
│  │  ├─ d.jpg
│  │  ├─ e.jpg
│  │  ├─ f.jpg
│  │  ├─ g.jpg
│  │  ├─ h.jpg
│  │  ├─ i.jpg
│  │  └─ talkcanvas.jpg
│  ├─ images
│  ├─ og-image.jpg
│  └─ og-image1.jpg
├─ README.md
├─ scripts
│  ├─ create-admin.ts
│  └─ seed.ts
├─ tsconfig.json
└─ types
   └─ model-viewer.d.ts

```
```
talk-canvas
├─ AGENTS.md
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ archive-prints
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ LogoutButton.tsx
│  │  ├─ orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ originals
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ archive-prints
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ cloudinary
│  │  │  │  └─ sign
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ originals
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ ar-model
│  │  │  └─ route.ts
│  │  ├─ archive-prints
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ cloudinary
│  │  │  └─ sign
│  │  │     └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ custom-order
│  │  │  └─ route.ts
│  │  ├─ enquiry
│  │  │  └─ route.ts
│  │  ├─ orders
│  │  │  └─ route.ts
│  │  └─ paystack
│  │     ├─ verify
│  │     │  └─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ checkout
│  │  ├─ page.tsx
│  │  └─ success
│  │     ├─ page.tsx
│  │     └─ SuccessView.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.svg
│  ├─ layout.tsx
│  ├─ originals
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ page.tsx
│  └─ prints
│     ├─ archive
│     │  └─ page.tsx
│     ├─ custom
│     │  └─ page.tsx
│     └─ page.tsx
├─ CLAUDE.md
├─ components
│  ├─ admin
│  │  ├─ AdminNav.tsx
│  │  ├─ ArchiveAdminCard.tsx
│  │  ├─ ArchiveUploader.tsx
│  │  ├─ DeleteButton.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ OrderStatusBadge.tsx
│  │  ├─ OrderStatusSelect.tsx
│  │  ├─ OriginalForm.tsx
│  │  └─ VisibilityToggle.tsx
│  ├─ cart
│  │  └─ CartDrawer.tsx
│  ├─ contact
│  │  └─ ContactForm.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ originals
│  │  ├─ EnquireButton.tsx
│  │  ├─ EnquiryModal.tsx
│  │  ├─ OriginalActions.tsx
│  │  └─ OriginalARModal.tsx
│  ├─ prints
│  │  ├─ ArchiveCard.tsx
│  │  ├─ ArchiveGrid.tsx
│  │  ├─ ArchivePickerModal.tsx
│  │  ├─ ARModal.tsx
│  │  ├─ ARViewer.tsx
│  │  ├─ Configurator.tsx
│  │  ├─ CustomOrderForm.tsx
│  │  ├─ FramedPreview.tsx
│  │  ├─ StepFrame.tsx
│  │  ├─ Stepper.tsx
│  │  ├─ StepReview.tsx
│  │  ├─ StepSize.tsx
│  │  ├─ StepUpload.tsx
│  │  └─ Summary.tsx
│  └─ WorkCard.tsx
├─ data
│  ├─ contact.ts
│  ├─ frames.ts
│  ├─ originals.ts
│  ├─ pricing.ts
│  ├─ shipping.ts
│  └─ sizes.ts
├─ drizzle
│  ├─ 0000_cold_ultimates.sql
│  ├─ 0001_simple_blade.sql
│  └─ meta
│     ├─ 0000_snapshot.json
│     ├─ 0001_snapshot.json
│     └─ _journal.json
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ lib
│  ├─ auth-server.ts
│  ├─ auth.ts
│  ├─ cartStore.ts
│  ├─ constants.ts
│  ├─ db
│  │  ├─ index.ts
│  │  ├─ queries
│  │  │  ├─ archivePrints.ts
│  │  │  ├─ arModels.ts
│  │  │  ├─ orders.ts
│  │  │  └─ originals.ts
│  │  └─ schema.ts
│  ├─ email
│  │  ├─ index.ts
│  │  ├─ styles.ts
│  │  └─ templates
│  │     ├─ ContactMessage.tsx
│  │     ├─ CustomOrderNotification.tsx
│  │     ├─ EnquiryNotification.tsx
│  │     ├─ OrderConfirmation.tsx
│  │     └─ OrderNotification.tsx
│  ├─ frameModel.ts
│  ├─ frameUSDZ.ts
│  ├─ image.ts
│  ├─ orders
│  │  └─ fulfillment.ts
│  ├─ originalDisplay.ts
│  ├─ paystack.ts
│  ├─ store.ts
│  ├─ upload.ts
│  └─ utils.ts
├─ LICENSE
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ frames
│  │  ├─ antique-black.jpg
│  │  ├─ antique-gold.jpg
│  │  ├─ regular-box-black.jpg
│  │  ├─ regular-box-brown.jpg
│  │  ├─ regular-box-gold.jpg
│  │  ├─ regular-box-white.jpg
│  │  ├─ regular-floating-black.jpg
│  │  ├─ regular-floating-brown.jpg
│  │  ├─ regular-floating-gold.jpg
│  │  └─ regular-floating-white.jpg
│  ├─ home
│  │  ├─ 1.jpg
│  │  ├─ 2.jpg
│  │  ├─ 3.jpg
│  │  ├─ 4.jpg
│  │  ├─ 701056196_18317350042279627_2981594976990571114_n.jpg
│  │  ├─ 701157189_18317637556279627_1141008268171820547_n.jpg
│  │  ├─ 701470636_18317350015279627_938129702075256091_n.jpg
│  │  ├─ 701480522_18317350024279627_7932182608816352102_n.jpg
│  │  ├─ 702651794_18317637586279627_7339476542703575625_n.jpg
│  │  ├─ 702696504_18317771173279627_7276012545033299743_n.jpg
│  │  ├─ 702729662_18317637640279627_8460142114219651625_n.jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n (1).jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n.jpg
│  │  ├─ 703055701_18317908519279627_7673709464511402851_n.jpg
│  │  ├─ 703988595_18317908561279627_2950059821325476066_n.jpg
│  │  ├─ a.jpg
│  │  ├─ b.jpg
│  │  ├─ c.jpg
│  │  ├─ d.jpg
│  │  ├─ e.jpg
│  │  ├─ f.jpg
│  │  ├─ g.jpg
│  │  ├─ h.jpg
│  │  ├─ i.jpg
│  │  └─ talkcanvas.jpg
│  ├─ images
│  ├─ og-image.jpg
│  └─ og-image1.jpg
├─ README.md
├─ scripts
│  ├─ create-admin.ts
│  └─ seed.ts
├─ tsconfig.json
└─ types
   └─ model-viewer.d.ts

```
```
talk-canvas
├─ AGENTS.md
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ archive-prints
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ LogoutButton.tsx
│  │  ├─ orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ originals
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ archive-prints
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ cloudinary
│  │  │  │  └─ sign
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ originals
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ ar-model
│  │  │  └─ route.ts
│  │  ├─ archive-prints
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ cloudinary
│  │  │  └─ sign
│  │  │     └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ custom-order
│  │  │  └─ route.ts
│  │  ├─ enquiry
│  │  │  └─ route.ts
│  │  ├─ orders
│  │  │  └─ route.ts
│  │  └─ paystack
│  │     ├─ verify
│  │     │  └─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ checkout
│  │  ├─ page.tsx
│  │  └─ success
│  │     ├─ page.tsx
│  │     └─ SuccessView.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.svg
│  ├─ layout.tsx
│  ├─ originals
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ page.tsx
│  └─ prints
│     ├─ archive
│     │  └─ page.tsx
│     ├─ custom
│     │  └─ page.tsx
│     └─ page.tsx
├─ CLAUDE.md
├─ components
│  ├─ admin
│  │  ├─ AdminNav.tsx
│  │  ├─ ArchiveAdminCard.tsx
│  │  ├─ ArchiveUploader.tsx
│  │  ├─ DeleteButton.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ OrderStatusBadge.tsx
│  │  ├─ OrderStatusSelect.tsx
│  │  ├─ OriginalForm.tsx
│  │  └─ VisibilityToggle.tsx
│  ├─ cart
│  │  └─ CartDrawer.tsx
│  ├─ contact
│  │  └─ ContactForm.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ originals
│  │  ├─ EnquireButton.tsx
│  │  ├─ EnquiryModal.tsx
│  │  ├─ OriginalActions.tsx
│  │  └─ OriginalARModal.tsx
│  ├─ prints
│  │  ├─ ArchiveCard.tsx
│  │  ├─ ArchiveGrid.tsx
│  │  ├─ ArchivePickerModal.tsx
│  │  ├─ ARModal.tsx
│  │  ├─ ARViewer.tsx
│  │  ├─ Configurator.tsx
│  │  ├─ CustomOrderForm.tsx
│  │  ├─ FramedPreview.tsx
│  │  ├─ StepFrame.tsx
│  │  ├─ Stepper.tsx
│  │  ├─ StepReview.tsx
│  │  ├─ StepSize.tsx
│  │  ├─ StepUpload.tsx
│  │  └─ Summary.tsx
│  └─ WorkCard.tsx
├─ data
│  ├─ contact.ts
│  ├─ frames.ts
│  ├─ originals.ts
│  ├─ pricing.ts
│  ├─ shipping.ts
│  └─ sizes.ts
├─ drizzle
│  ├─ 0000_cold_ultimates.sql
│  ├─ 0001_simple_blade.sql
│  └─ meta
│     ├─ 0000_snapshot.json
│     ├─ 0001_snapshot.json
│     └─ _journal.json
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ lib
│  ├─ auth-server.ts
│  ├─ auth.ts
│  ├─ cartStore.ts
│  ├─ constants.ts
│  ├─ db
│  │  ├─ index.ts
│  │  ├─ queries
│  │  │  ├─ archivePrints.ts
│  │  │  ├─ arModels.ts
│  │  │  ├─ orders.ts
│  │  │  └─ originals.ts
│  │  └─ schema.ts
│  ├─ email
│  │  ├─ index.ts
│  │  ├─ styles.ts
│  │  └─ templates
│  │     ├─ ContactMessage.tsx
│  │     ├─ CustomOrderNotification.tsx
│  │     ├─ EnquiryNotification.tsx
│  │     ├─ OrderConfirmation.tsx
│  │     └─ OrderNotification.tsx
│  ├─ frameModel.ts
│  ├─ frameUSDZ.ts
│  ├─ image.ts
│  ├─ orders
│  │  └─ fulfillment.ts
│  ├─ originalDisplay.ts
│  ├─ paystack.ts
│  ├─ store.ts
│  ├─ upload.ts
│  └─ utils.ts
├─ LICENSE
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ frames
│  │  ├─ antique-black.jpg
│  │  ├─ antique-gold.jpg
│  │  ├─ regular-box-black.jpg
│  │  ├─ regular-box-brown.jpg
│  │  ├─ regular-box-gold.jpg
│  │  ├─ regular-box-white.jpg
│  │  ├─ regular-floating-black.jpg
│  │  ├─ regular-floating-brown.jpg
│  │  ├─ regular-floating-gold.jpg
│  │  └─ regular-floating-white.jpg
│  ├─ home
│  │  ├─ 1.jpg
│  │  ├─ 2.jpg
│  │  ├─ 3.jpg
│  │  ├─ 4.jpg
│  │  ├─ 701056196_18317350042279627_2981594976990571114_n.jpg
│  │  ├─ 701157189_18317637556279627_1141008268171820547_n.jpg
│  │  ├─ 701470636_18317350015279627_938129702075256091_n.jpg
│  │  ├─ 701480522_18317350024279627_7932182608816352102_n.jpg
│  │  ├─ 702651794_18317637586279627_7339476542703575625_n.jpg
│  │  ├─ 702696504_18317771173279627_7276012545033299743_n.jpg
│  │  ├─ 702729662_18317637640279627_8460142114219651625_n.jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n (1).jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n.jpg
│  │  ├─ 703055701_18317908519279627_7673709464511402851_n.jpg
│  │  ├─ 703988595_18317908561279627_2950059821325476066_n.jpg
│  │  ├─ a.jpg
│  │  ├─ b.jpg
│  │  ├─ c.jpg
│  │  ├─ d.jpg
│  │  ├─ e.jpg
│  │  ├─ f.jpg
│  │  ├─ g.jpg
│  │  ├─ h.jpg
│  │  ├─ i.jpg
│  │  └─ talkcanvas.jpg
│  ├─ images
│  ├─ og-image.jpg
│  └─ og-image1.jpg
├─ README.md
├─ scripts
│  ├─ create-admin.ts
│  └─ seed.ts
├─ tsconfig.json
└─ types
   └─ model-viewer.d.ts

```
```
talk-canvas
├─ AGENTS.md
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ archive-prints
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ LogoutButton.tsx
│  │  ├─ orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ originals
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ archive-prints
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ cloudinary
│  │  │  │  └─ sign
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ originals
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ ar-model
│  │  │  └─ route.ts
│  │  ├─ archive-prints
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ cloudinary
│  │  │  └─ sign
│  │  │     └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ custom-order
│  │  │  └─ route.ts
│  │  ├─ enquiry
│  │  │  └─ route.ts
│  │  ├─ orders
│  │  │  └─ route.ts
│  │  └─ paystack
│  │     ├─ verify
│  │     │  └─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ checkout
│  │  ├─ page.tsx
│  │  └─ success
│  │     ├─ page.tsx
│  │     └─ SuccessView.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.svg
│  ├─ layout.tsx
│  ├─ originals
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ page.tsx
│  └─ prints
│     ├─ archive
│     │  └─ page.tsx
│     ├─ custom
│     │  └─ page.tsx
│     └─ page.tsx
├─ CLAUDE.md
├─ components
│  ├─ admin
│  │  ├─ AdminNav.tsx
│  │  ├─ ArchiveAdminCard.tsx
│  │  ├─ ArchiveUploader.tsx
│  │  ├─ DeleteButton.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ OrderStatusBadge.tsx
│  │  ├─ OrderStatusSelect.tsx
│  │  ├─ OriginalForm.tsx
│  │  └─ VisibilityToggle.tsx
│  ├─ cart
│  │  └─ CartDrawer.tsx
│  ├─ contact
│  │  └─ ContactForm.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ originals
│  │  ├─ EnquireButton.tsx
│  │  ├─ EnquiryModal.tsx
│  │  ├─ OriginalActions.tsx
│  │  └─ OriginalARModal.tsx
│  ├─ prints
│  │  ├─ ArchiveCard.tsx
│  │  ├─ ArchiveGrid.tsx
│  │  ├─ ArchivePickerModal.tsx
│  │  ├─ ARModal.tsx
│  │  ├─ ARViewer.tsx
│  │  ├─ Configurator.tsx
│  │  ├─ CustomOrderForm.tsx
│  │  ├─ FramedPreview.tsx
│  │  ├─ StepFrame.tsx
│  │  ├─ Stepper.tsx
│  │  ├─ StepReview.tsx
│  │  ├─ StepSize.tsx
│  │  ├─ StepUpload.tsx
│  │  └─ Summary.tsx
│  └─ WorkCard.tsx
├─ data
│  ├─ contact.ts
│  ├─ frames.ts
│  ├─ originals.ts
│  ├─ pricing.ts
│  ├─ shipping.ts
│  └─ sizes.ts
├─ drizzle
│  ├─ 0000_cold_ultimates.sql
│  ├─ 0001_simple_blade.sql
│  └─ meta
│     ├─ 0000_snapshot.json
│     ├─ 0001_snapshot.json
│     └─ _journal.json
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ lib
│  ├─ auth-server.ts
│  ├─ auth.ts
│  ├─ cartStore.ts
│  ├─ constants.ts
│  ├─ db
│  │  ├─ index.ts
│  │  ├─ queries
│  │  │  ├─ archivePrints.ts
│  │  │  ├─ arModels.ts
│  │  │  ├─ orders.ts
│  │  │  └─ originals.ts
│  │  └─ schema.ts
│  ├─ email
│  │  ├─ index.ts
│  │  ├─ styles.ts
│  │  └─ templates
│  │     ├─ ContactMessage.tsx
│  │     ├─ CustomOrderNotification.tsx
│  │     ├─ EnquiryNotification.tsx
│  │     ├─ OrderConfirmation.tsx
│  │     └─ OrderNotification.tsx
│  ├─ frameModel.ts
│  ├─ frameUSDZ.ts
│  ├─ image.ts
│  ├─ orders
│  │  └─ fulfillment.ts
│  ├─ originalDisplay.ts
│  ├─ paystack.ts
│  ├─ store.ts
│  ├─ upload.ts
│  └─ utils.ts
├─ LICENSE
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ frames
│  │  ├─ antique-black.jpg
│  │  ├─ antique-gold.jpg
│  │  ├─ regular-box-black.jpg
│  │  ├─ regular-box-brown.jpg
│  │  ├─ regular-box-gold.jpg
│  │  ├─ regular-box-white.jpg
│  │  ├─ regular-floating-black.jpg
│  │  ├─ regular-floating-brown.jpg
│  │  ├─ regular-floating-gold.jpg
│  │  └─ regular-floating-white.jpg
│  ├─ home
│  │  ├─ 1.jpg
│  │  ├─ 2.jpg
│  │  ├─ 3.jpg
│  │  ├─ 4.jpg
│  │  ├─ 701056196_18317350042279627_2981594976990571114_n.jpg
│  │  ├─ 701157189_18317637556279627_1141008268171820547_n.jpg
│  │  ├─ 701470636_18317350015279627_938129702075256091_n.jpg
│  │  ├─ 701480522_18317350024279627_7932182608816352102_n.jpg
│  │  ├─ 702651794_18317637586279627_7339476542703575625_n.jpg
│  │  ├─ 702696504_18317771173279627_7276012545033299743_n.jpg
│  │  ├─ 702729662_18317637640279627_8460142114219651625_n.jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n (1).jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n.jpg
│  │  ├─ 703055701_18317908519279627_7673709464511402851_n.jpg
│  │  ├─ 703988595_18317908561279627_2950059821325476066_n.jpg
│  │  ├─ a.jpg
│  │  ├─ b.jpg
│  │  ├─ c.jpg
│  │  ├─ d.jpg
│  │  ├─ e.jpg
│  │  ├─ f.jpg
│  │  ├─ g.jpg
│  │  ├─ h.jpg
│  │  ├─ i.jpg
│  │  └─ talkcanvas.jpg
│  ├─ images
│  ├─ og-image.jpg
│  └─ og-image1.jpg
├─ README.md
├─ scripts
│  ├─ create-admin.ts
│  └─ seed.ts
├─ tsconfig.json
└─ types
   └─ model-viewer.d.ts

```
```
talk-canvas
├─ AGENTS.md
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ archive-prints
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ LogoutButton.tsx
│  │  ├─ orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ originals
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ archive-prints
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ cloudinary
│  │  │  │  └─ sign
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ originals
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ ar-model
│  │  │  └─ route.ts
│  │  ├─ archive-prints
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ cloudinary
│  │  │  └─ sign
│  │  │     └─ route.ts
│  │  ├─ contact
│  │  │  └─ route.ts
│  │  ├─ custom-order
│  │  │  └─ route.ts
│  │  ├─ enquiry
│  │  │  └─ route.ts
│  │  ├─ orders
│  │  │  └─ route.ts
│  │  └─ paystack
│  │     ├─ verify
│  │     │  └─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ checkout
│  │  ├─ page.tsx
│  │  └─ success
│  │     ├─ page.tsx
│  │     └─ SuccessView.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.svg
│  ├─ layout.tsx
│  ├─ originals
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ page.tsx
│  └─ prints
│     ├─ archive
│     │  └─ page.tsx
│     ├─ custom
│     │  └─ page.tsx
│     └─ page.tsx
├─ CLAUDE.md
├─ components
│  ├─ admin
│  │  ├─ AdminNav.tsx
│  │  ├─ ArchiveAdminCard.tsx
│  │  ├─ ArchiveUploader.tsx
│  │  ├─ DeleteButton.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ OrderStatusBadge.tsx
│  │  ├─ OrderStatusSelect.tsx
│  │  ├─ OriginalForm.tsx
│  │  └─ VisibilityToggle.tsx
│  ├─ cart
│  │  └─ CartDrawer.tsx
│  ├─ contact
│  │  └─ ContactForm.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ originals
│  │  ├─ EnquireButton.tsx
│  │  ├─ EnquiryModal.tsx
│  │  ├─ OriginalActions.tsx
│  │  └─ OriginalARModal.tsx
│  ├─ prints
│  │  ├─ ArchiveCard.tsx
│  │  ├─ ArchiveGrid.tsx
│  │  ├─ ArchivePickerModal.tsx
│  │  ├─ ARModal.tsx
│  │  ├─ ARViewer.tsx
│  │  ├─ Configurator.tsx
│  │  ├─ CustomOrderForm.tsx
│  │  ├─ FramedPreview.tsx
│  │  ├─ StepFrame.tsx
│  │  ├─ Stepper.tsx
│  │  ├─ StepReview.tsx
│  │  ├─ StepSize.tsx
│  │  ├─ StepUpload.tsx
│  │  └─ Summary.tsx
│  └─ WorkCard.tsx
├─ data
│  ├─ contact.ts
│  ├─ frames.ts
│  ├─ originals.ts
│  ├─ pricing.ts
│  ├─ shipping.ts
│  └─ sizes.ts
├─ drizzle
│  ├─ 0000_cold_ultimates.sql
│  ├─ 0001_simple_blade.sql
│  └─ meta
│     ├─ 0000_snapshot.json
│     ├─ 0001_snapshot.json
│     └─ _journal.json
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ lib
│  ├─ auth-server.ts
│  ├─ auth.ts
│  ├─ cartStore.ts
│  ├─ constants.ts
│  ├─ db
│  │  ├─ index.ts
│  │  ├─ queries
│  │  │  ├─ archivePrints.ts
│  │  │  ├─ arModels.ts
│  │  │  ├─ orders.ts
│  │  │  └─ originals.ts
│  │  └─ schema.ts
│  ├─ email
│  │  ├─ index.ts
│  │  ├─ styles.ts
│  │  └─ templates
│  │     ├─ ContactMessage.tsx
│  │     ├─ CustomOrderNotification.tsx
│  │     ├─ EnquiryNotification.tsx
│  │     ├─ OrderConfirmation.tsx
│  │     └─ OrderNotification.tsx
│  ├─ frameModel.ts
│  ├─ frameUSDZ.ts
│  ├─ image.ts
│  ├─ orders
│  │  └─ fulfillment.ts
│  ├─ originalDisplay.ts
│  ├─ paystack.ts
│  ├─ store.ts
│  ├─ upload.ts
│  └─ utils.ts
├─ LICENSE
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ frames
│  │  ├─ antique-black.jpg
│  │  ├─ antique-gold.jpg
│  │  ├─ regular-box-black.jpg
│  │  ├─ regular-box-brown.jpg
│  │  ├─ regular-box-gold.jpg
│  │  ├─ regular-box-white.jpg
│  │  ├─ regular-floating-black.jpg
│  │  ├─ regular-floating-brown.jpg
│  │  ├─ regular-floating-gold.jpg
│  │  └─ regular-floating-white.jpg
│  ├─ home
│  │  ├─ 1.jpg
│  │  ├─ 2.jpg
│  │  ├─ 3.jpg
│  │  ├─ 4.jpg
│  │  ├─ 701056196_18317350042279627_2981594976990571114_n.jpg
│  │  ├─ 701157189_18317637556279627_1141008268171820547_n.jpg
│  │  ├─ 701470636_18317350015279627_938129702075256091_n.jpg
│  │  ├─ 701480522_18317350024279627_7932182608816352102_n.jpg
│  │  ├─ 702651794_18317637586279627_7339476542703575625_n.jpg
│  │  ├─ 702696504_18317771173279627_7276012545033299743_n.jpg
│  │  ├─ 702729662_18317637640279627_8460142114219651625_n.jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n (1).jpg
│  │  ├─ 702745988_18317908564279627_1126790565584706289_n.jpg
│  │  ├─ 703055701_18317908519279627_7673709464511402851_n.jpg
│  │  ├─ 703988595_18317908561279627_2950059821325476066_n.jpg
│  │  ├─ a.jpg
│  │  ├─ b.jpg
│  │  ├─ c.jpg
│  │  ├─ d.jpg
│  │  ├─ e.jpg
│  │  ├─ f.jpg
│  │  ├─ g.jpg
│  │  ├─ h.jpg
│  │  ├─ i.jpg
│  │  └─ talkcanvas.jpg
│  ├─ images
│  ├─ og-image.jpg
│  └─ og-image1.jpg
├─ README.md
├─ scripts
│  ├─ create-admin.ts
│  └─ seed.ts
├─ tsconfig.json
└─ types
   └─ model-viewer.d.ts

```