# Your Store — Owner's Manual

This is your guide to running your shop day to day: adding products, changing
prices, updating stock, and handling orders. No technical knowledge needed.
Everything happens in one place, called the **admin**.

Read it once, then keep it open the first few times. Nothing here can break
your website — the worst that happens is a product looks wrong, and you fix it
in ten seconds.

---

## Your store's details

Fill this in once (your developer will give you these):

| | |
|---|---|
| Your shop | `https://__________________` |
| Your admin | `https://__________________/admin` |
| Your password | Keep it in your password manager — **not** in a note on your phone |
| Your categories | `__________________` (you must type these exactly — see §4) |
| Your collections | `__________________` (optional — see §4) |

---

## 1. Signing in

1. Go to your website address and add **`/admin`** at the end.
   Example: `https://mystore.com/admin`
2. Type your password and press **Sign in**.

That's it — there's no username.

**A few things to know:**

- The admin is intentionally **hidden**. There's no link to it anywhere on
  your shop, and Google won't list it. The address itself is not a secret, but
  your password is — anyone with it can change your prices and read your
  orders. Don't share it, don't email it.
- You stay signed in for **24 hours**, then you'll be asked for the password
  again. If a screen suddenly bounces you back to the login page, that's all
  this is. Sign in again and carry on.
- Use a **computer**, not a phone. The admin works on a phone for small edits,
  but reordering products (§6) needs a mouse.
- **Sign out** is in the top-right corner. Always use it on a shared or public
  computer.

---

## 2. The three tabs

Across the top you'll see:

| Tab | What it's for |
|---|---|
| **Products** | Everything customers see in the shop — add, edit, price, stock, photos, order |
| **Orders** | Orders that came in, and marking them confirmed / fulfilled |
| **Messages** | Messages from your contact form, and your newsletter email list |

You'll live in **Products**.

---

## 3. The Products table — reading it

When you open Products you see one row per product:

| Column | Meaning |
|---|---|
| `⠿` | The drag handle. Grab it to change the order products appear in your shop (§6) |
| **Name** | As shown on the website |
| **Category** | Which section of the shop it sits in |
| **Price** | What customers pay |
| **Stock per size** | One small box per size — **type directly into these** (§5) |
| **Active** | `yes` = visible in the shop, `no` = hidden |
| | **Edit** and **Deactivate** buttons |

Hidden (inactive) products stay in this list, greyed out, so you can bring them
back later.

---

## 4. Adding a product

Press **+ Add product**. You'll get a form. Here's every field, in plain terms.

### The required four

You cannot save without these:

- **Name\*** — exactly as you want it on the website. Type it the way you want
  it read; the site handles the styling.
- **Price\*** — in normal money, the way you'd write it on a price tag:
  `220` or `220.50`. Not cents/agorot.
- **Category\*** — ⚠️ **this must match one of your categories exactly**
  (see your list at the top of this manual). `bottoms` is not the same as
  `Bottoms` or `bottom`. Get this wrong and the product won't appear when
  customers filter the shop. If you're unsure, copy the spelling from an
  existing product's row in the table.
- **At least one size** — see *Sizes & stock* below.

### The optional ones

- **Drop** — the collection this belongs to (like `summer-25`). Same warning as
  Category: it must match one of your collection names exactly. Leave it blank
  if you don't use collections.
- **Family** — this is what powers the **"Complete the set"** strip at the
  bottom of a product page. Give every piece of the same print the *same*
  family word, and each one will show the others.
  Example: give both `WILD FLOWER TIE BOTTOM` and `WILD FLOWER TRIANGLE TOP`
  the family `wild-flower`, and each page invites the customer to the other.
  - It must be spelled **identically** — `wild-flower` and `Wild Flower` are
    two different families and neither will link up.
  - A family needs **at least two products** to do anything.
  - Leave it blank and the product page shows a generic "You may also like"
    strip from the same category instead. Nothing breaks.
- **Cut** — the style name within a family (`Tie Bottom`, `Triangle Top`).
- **Size label** — the wording above the size dropdown on the product page.
  Type `Bottom Size` and the customer sees "BOTTOM SIZE". Leave it blank and it
  just says "Size".
- **Description** — a short paragraph shown under the price. Leave it empty and
  the product page simply doesn't show that block — it won't look unfinished.

### Photos

- Press **Upload images**, pick one or several files from your computer, and
  wait for "Uploading…" to finish. Thumbnails appear so you can check them.
- **The first photo is the main one.** The second is what appears when a
  customer hovers over the product in the shop grid. Give every product at
  least two.
- **Use square photos (1:1).** The shop crops to square anyway, so anything
  else gets trimmed — usually across someone's head.
- Accepted: JPG, PNG, WEBP, GIF, AVIF. **Maximum 5 MB each**, but aim for under
  400 KB — huge photos make your site slow to load, which loses sales.
- To remove or reorder photos, edit the list in the **Image URLs** box: one
  address per line, top line = main photo. Delete a line to remove that photo.

### Sizes & stock

Each row is one size:

- **Left box** = the size name as customers see it (`XS`, `S`, `M`, `One size`).
- **Right box** = how many you have.
- **+ Add size** for another row, **Remove** to delete one.
- Sizes must be unique — you can't have `S` twice.
- One-size items: a single row named `One size`.

### Active

Leave **Active** ticked to publish it. Untick it to build a product now and
release it later.

Press **Save**. It appears at the bottom of your shop's product list — see §6
to move it.

---

## 5. Everyday changes

### Change stock (the fastest one)

You don't need to open the product. In the table, click the number under
**Stock per size**, type the new figure, then **click somewhere else on the
page**. That's what saves it. There's no Save button for this.

### Mark something sold out

**Set its stock to 0.** That's the whole method — there is no "sold out"
switch.

- One size at 0 → that size shows as "out of stock" in the dropdown and can't
  be selected.
- **Every** size at 0 → the whole product switches to "Out of stock" and the
  buy buttons are replaced by **Notify When Available**, which collects
  interested customers' emails for you.

Restocking is the same in reverse: type a number above 0 and it's buyable
again, instantly.

### Change a price, name, description or photos

Press **Edit** on the row, change what you need, press **Save**.

Changing a name or price **never affects orders you've already received** —
each order keeps a copy of what was bought and what it cost at the time. Edit
freely.

### Hide or remove a product

Press **Deactivate**. It disappears from your shop immediately.

- ⚠️ **There's no "are you sure?" confirmation.** One click and it's hidden.
- Nothing is actually deleted — the product stays in your table marked
  `Active: no`, and your order history is untouched.
- **To bring it back:** press **Edit** on the greyed-out row, tick **Active**,
  press **Save**.

There is no permanent delete, on purpose. It protects your records.

---

## 6. Changing the order products appear in

The order of rows in the Products table *is* the order customers see in your
shop.

Click and hold the **`⠿`** handle on the left of a row, drag it up or down, and
let go. It saves by itself.

- Needs a **mouse** — dragging doesn't work by touch on a phone or tablet.
- Grab the handle specifically, not the row.
- Put your newest or best-selling pieces at the top; that's the first thing
  visitors see.

---

## 7. Orders

> **If your checkout goes to WhatsApp**, orders arrive as WhatsApp messages and
> this tab stays empty. That's normal — skip this section.

Orders are listed newest first. Along the top you see how many are in each
state, and a filter to show just one state.

Click an order to expand it — you'll see the customer's phone, email, the date,
any note they left, and every item with size, quantity and price.

### Statuses

Each order moves forward through these:

```
new  →  confirmed  →  fulfilled
 ↓          ↓
    cancelled
```

| Status | Means |
|---|---|
| **new** | Just arrived, you haven't dealt with it |
| **confirmed** | You've spoken to the customer / taken payment |
| **fulfilled** | Shipped or handed over. Done. |
| **cancelled** | Called off |

Change it with the **Set status** dropdown inside the order.

⚠️ **Statuses only move forward.** Once an order is *fulfilled* or *cancelled*,
it's locked — you cannot move it back, and the dropdown disappears. This is
deliberate, so your history stays honest. Don't mark things fulfilled in
advance.

Stock is **not** reduced automatically when an order comes in. Adjust it
yourself in the Products table.

---

## 8. Messages

Two read-only lists:

- **Contact messages** — everything sent through your contact form, with the
  sender's name, email, date, and whether they ticked the newsletter box.
- **Subscribers** — everyone who signed up to your newsletter. Press
  **Copy all emails** to copy the whole list to your clipboard, ready to paste
  into your mailing tool.

Nothing here can be edited or deleted from the admin.

---

## 9. What you can change yourself — and what needs your developer

**You control, any time:**
product names, prices, descriptions, photos, sizes, stock, categories a product
sits in, families, the order products appear in, hiding/showing products, order
statuses.

**Ask your developer for:**

| Thing | Why |
|---|---|
| The **Product Care** and **Shipping & Returns** text on product pages | Written into the site, not the product |
| About / policy / privacy page text | Same |
| Adding or renaming a **category** or **collection** | These are part of the site's structure |
| Colours, fonts, logo | Part of the design |
| The **size guide** tables | Part of the site |
| The Instagram grid on the homepage | Part of the site |
| Homepage hero and category photos | Part of the site |
| Currency symbol, announcement bar, contact details | Part of the site |

These are quick changes for them — just not ones you can make from the admin.

---

## 10. Quick fixes

| What you see | What to do |
|---|---|
| Sent back to the login screen | Your 24-hour session ended. Sign in again. |
| A product isn't showing in the shop | Check **Active** is `yes`, and that **Category** is spelled exactly like your other products |
| "Complete the set" isn't appearing | Both products need the **same Family** spelling, and both must be Active |
| A size can't be selected on the site | Its stock is 0. Change the number in the table. |
| "Name and category are required" | One of the two is empty |
| "Price must be a number" | Remove any currency symbol or letters — digits only, e.g. `220` |
| "At least one size is required" | Add a size row with a name in it |
| Upload fails | The file is over 5 MB, or isn't an image. Shrink it and retry. |
| A photo shows as a broken square | Its address in the Image URLs box is wrong — delete that line and re-upload |
| Dragging to reorder does nothing | Use a computer with a mouse, and grab the `⠿` handle itself |
| Stock change didn't stick | Click elsewhere on the page after typing — that's what saves it |

---

## 11. Five habits that keep the shop tidy

1. **Two square photos per product**, main first, alternate second.
2. **Copy the category spelling** from an existing product rather than typing
   it fresh.
3. **Stock to 0, never Deactivate**, for something temporarily unavailable —
   the Notify list then collects customers waiting for it.
4. **Drag your newest pieces to the top** after adding them.
5. **Check the shop itself** after a batch of changes. Open your website in
   another tab and refresh — that's what your customers see.
