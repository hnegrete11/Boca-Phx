# boca

A static website: plain HTML, CSS and JavaScript. No build step, no server and no database.

```
index.html     page structure and copy
styles.css     all styling
app.js         menu, order to go, dinner reservations, Ropa y Objetos, Arte
gracias.html   the hidden page (not in the menu)
qr-*.png       the three payment QR codes for that page
*.png, *.jpg   the scanned menu paper and the dancing-dogs prints
fotos/         (you add this) the six Arte photos
```

## Preview on your computer

Open `index.html` in a browser. Or run a local server from the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000

## Publish with GitHub Pages

1. Put all the files in a GitHub repository, at the top level.
2. In the repository, open Settings, then Pages. Under "Build and deployment" choose "Deploy from a branch", pick `main` and `/ (root)`, and save.
3. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

To update the site later, replace or edit a file in the repository. Pages republishes within a minute or two.

### Connect your domain

1. In Settings, then Pages, enter your domain under "Custom domain" and save.
2. At your registrar, add DNS records:
   - Root domain (for example `yourname.com`): four `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
   - `www`: a `CNAME` record pointing to `YOUR-USERNAME.github.io`.
3. When the option appears in Settings, then Pages, tick "Enforce HTTPS".

GitHub's current instructions: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## Make orders and reservations reach you

A static site cannot receive form submissions by itself. Use a form service that emails you each one, such as Formspree (formspree.io):

1. Create a form there and copy its endpoint URL (it looks like `https://formspree.io/f/xxxxxxxx`).
2. Open `app.js` and paste it here:

   ```js
   var SUBMIT_URL = 'https://formspree.io/f/xxxxxxxx';
   ```

3. Place a test order and a test reservation on the live site and confirm both emails arrive.

Until `SUBMIT_URL` is set, customers see a screen with their details to copy, and nothing reaches you. The site takes no payments: orders are paid at pickup.

## Photos in the Arte tab

The Arte tab shows six square photos. Put them in a folder named `fotos` at the top level of the repository, named exactly like this (capital first letter; `.png` is best, `.jpg`, `.jpeg` and `.webp` also work):

`CA.png`, `Volcan.png`, `PHX.png`, `Colima.png`, `Torres.png`, `Benito.png`

To replace a photo, upload a file with the same name. A photo that is missing is simply left out. Tapping a photo opens it larger. Tapping `Benito` (the bill) goes to the hidden page below.

To add more photos later, add a line to the `ART` list near the top of `app.js`, following the pattern of the existing lines.

## The hidden page

`gracias.html` is not linked from the menu. Customers reach it by tapping the bill in Arte, or by scanning the QR code at the stand. Use the address `https://YOUR-DOMAIN/gracias.html`. It opens on the collage, and tapping the bill there shows the three codes. It uses `boca.png`, `dogs.png` and the three `qr-` images from the top level. To change a payment link, edit the three `Open` links in `gracias.html`. Search engines are asked to skip the page, but anyone with the address can open it.

## Edit the rest

All of these are near the top of `app.js`:

- **Menu and prices:** the `MENU` list. `temps: true` offers caliente and frio buttons.
- **To-go days and times:** `TOGO`. Days are numbers (Sunday is 0, Saturday is 6). Times are minutes after midnight, so 9 AM is 540 and 4 PM is 960.
- **Dinner nights and seatings:** `DINNER`, in the same format.
- **Hours on the home page:** the "Hours / Horas" list in `index.html`. Keep it in step with `TOGO` and `DINNER`.
- **Ropa y Objetos:** the `PIECES` list. Until it has at least one piece, the page says "Pronto". Visitors can ask to hold a piece and pay at pickup.
- **Sonidos:** currently "Pronto". Edit that section in `index.html`.

## Notes

- Fonts load from Google Fonts (Jost), so the site needs an internet connection to show them.
- The dancing-dogs prints were cut from a photo you supplied. Make sure you have the right to use it, or replace `dogs.png` and `dogs-wm.png` with your own.
- The version hosted inside Claude has a private inbox. This version does not. Your form service's emails take its place.
