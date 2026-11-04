# boca

A static website: plain HTML, CSS and JavaScript. No build step, no server and no database.

```
index.html     page structure and copy
styles.css     all styling
app.js         menu, order to go, dinner reservations, Ropa y Objetos, Arte
*.png, *.jpg   the scanned menu paper and the dancing-dogs prints
assets/        (you create this) your Arte photos and paintings
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

## Add art to the Arte tab

Until you add pieces, the tab just says "Pronto".

1. Prepare your images as JPEGs, about 1600 pixels on the long side and under about 500 KB each, so the page loads quickly.
2. Create the folder: in your repository choose Add file, then Create new file, type `assets/.gitkeep` as the file name (typing the slash makes the folder) and commit it.
3. Open the `assets` folder, choose Add file, then Upload files, and drop your images in.
4. In `app.js`, set your inquiry email and list each piece:

   ```js
   var INQUIRY_EMAIL = 'you@yourdomain.com';
   var ART = [
     { id: 'a1', title: 'Untitled', artist: 'Your name', year: '2024', medium: 'Oil on canvas', status: 'available', price: 900, img: 'painting-01.jpg' },
     { id: 'a2', title: 'Volcan', artist: 'Guest artist', year: '2023', medium: 'Photograph', status: 'nfs', img: 'photo-01.jpg' }
   ];
   ```

   `status` is `available`, `nfs` (not for sale) or `sold`. Leave `price` out to show "Price on request". If your images sit at the top level instead of in `assets`, set `ART_FOLDER = ''`.

Each piece opens larger when clicked, with an "Inquire about this piece" email link. Get permission from guest artists before showing their work, and credit them.

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
