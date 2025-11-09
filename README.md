# Soulful Kitchen — Single page site (cPanel-ready)

This repository contains a complete single-page website for Soulful Kitchen,
including a PHP form handler that appends form submissions to `data/submissions.csv`
and attempts to send an email via `mail()`.

## Files
- `index.html` — main page (hero, features, callout, video, booking form, brand story, footer)
- `css/styles.css` — styles, fonts, responsive rules
- `js/main.js` — modal, forms AJAX, smooth scroll, focus trap, date min, toast
- `form-handler.php` — server-side handler (saves CSV, sends email)
- `success.html` — fallback thank-you page
- `data/submissions.csv` — submissions CSV (header row provided)
- `assets/` — place your real assets here (logo, fonts, hero video, posters, client logos)

## Required asset files (place in `assets/`)
- `assets/logo.svg`
- `assets/hero.webm`
- `assets/hero.mp4`
- `assets/hero-poster.jpg`
- `assets/hero-poster-mobile.jpg`
- `assets/client-acme.png`
- `assets/client-kula.png`
- `assets/client-room.png`
- `assets/fonts/Lufga-Regular.woff2`
- `assets/fonts/Lufga-Bold.woff2`
- `assets/fonts/BlackForoth-Regular.woff2`
- `assets/fonts/IndigoDaisy-Regular.woff2`

> If you do not have the brand fonts, the site will fall back to system fonts,
> but to match the brand install the `.woff2` files exactly with these filenames.

## Server configuration (cPanel)
1. Upload the project folder or ZIP to `public_html` using cPanel File Manager.
2. Ensure `data/` is writable by PHP (set permissions to `755` or `775` as required).
3. Open `form-handler.php` and change `$TO_EMAIL` to your real destination email. Also optionally set `$FROM_EMAIL` to a domain-managed address to reduce spam issues.
4. Test forms: submit the quick lead and the booking form. They should append a line to `data/submissions.csv` and return JSON `{"ok":true}` to the AJAX client.

## Notes on mail()
- `form-handler.php` uses PHP `mail()` by default. Some hosts require SMTP authenticated mail.
- If `mail()` fails, you can replace the sending block with PHPMailer or similar:
  - Install PHPMailer or drop `PHPMailer` into the repo.
  - Configure SMTP credentials provided by your host.
- Contact me if you want a PHPMailer + SMTP `form-handler.php` variant.

## Accessibility & behavior references
- Hero, booking form and copy follow the uploaded brand docs:
  - Brand story & "Who we are" — *Who we are.pdf*. :contentReference[oaicite:11]{index=11}
  - Booking form & popup copy — *Pop_Up.pdf*, *On Landing Page.pdf*. :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13}
  - Brand guide (colors, typography) — *Brand_Guide.pdf*. :contentReference[oaicite:14]{index=14}
  - Layout wireframes — *scan (7).pdf* (sketch flow used for hero, features, central callout, booking form). :contentReference[oaicite:15]{index=15}

## Testing checklist
- Desktop: hero video autoplay muted & loop; overlay readable; slow zoom; Watch video modal works; Book a call scrolls to booking form and focuses the first input.
- Mobile: hero video hidden; poster image shown; layout stacks, forms usable.
- Forms: AJAX posts and CSV updated; non-JS fallback posts to `form-handler.php` and redirects to `success.html`.
- Accessibility: modal has `role="dialog"`, `aria-modal="true"`, ESC/backdrop close, focus trap implemented. All inputs have labels.

## Replace placeholders
- Replace `YOUTUBE_VIDEO_ID` in `index.html` and buttons (data attributes) with your YouTube ID.
- Replace placeholder images and fonts in `assets/`.
- Update `$TO_EMAIL` in `form-handler.php`.

## Deployment
1. Zip the folder or upload it directly via cPanel File Manager.
2. Extract into `public_html`.
3. Confirm `data/` directory exists and is writable.
4. Test forms and video.

If you want, I can produce a PHPMailer SMTP variant for `form-handler.php` or generate a ZIP for you after you upload the fonts, logo and hero video here.
