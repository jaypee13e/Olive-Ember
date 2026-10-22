const DEV = { name: "Your Name", email: "you@example.com" }; // edit these two lines

document.getElementById("devname").textContent = DEV.name;
document.getElementById("devmail").href =
  "mailto:" +
  DEV.email +
  "?subject=" +
  encodeURIComponent("Restaurant website quote");

const CATS = ["Starters", "Mains", "Desserts", "Drinks"];
const DIETS = ["Vegetarian", "Vegan", "Spicy", "Gluten-free"];

// Each row: category, name, description, price, tags
const MENU = [
  ["Starters", "Burrata and roasted tomato", "Creamy burrata, slow-roasted tomatoes, basil oil.", 12, ["Vegetarian", "Gluten-free"]],
  ["Starters", "Crispy squid", "Lightly fried squid with chili salt and lime.", 13, ["Spicy"]],
  ["Starters", "Charred corn soup", "Smoky sweet corn, coconut cream, toasted seeds.", 9, ["Vegetarian", "Vegan", "Gluten-free"]],
  ["Starters", "Whipped feta", "Feta, honey and thyme with warm flatbread.", 10, ["Vegetarian"]],
  ["Mains", "Wood-fired chicken", "Half chicken, lemon, thyme and garlic potatoes.", 22, ["Gluten-free"]],
  ["Mains", "Mushroom risotto", "Arborio rice, wild mushrooms, parmesan, parsley.", 19, ["Vegetarian", "Gluten-free"]],
  ["Mains", "Spicy lamb rigatoni", "Slow-cooked lamb ragu with chili and mint.", 23, ["Spicy"]],
  ["Mains", "Roasted cauliflower steak", "Tahini, pomegranate, toasted almonds.", 18, ["Vegetarian", "Vegan", "Gluten-free"]],
  ["Mains", "Seared salmon", "Crisp skin, herb potatoes, salsa verde.", 25, ["Gluten-free"]],
  ["Mains", "Harissa chickpea bowl", "Spiced chickpeas, greens, cucumber, herbs.", 17, ["Vegetarian", "Vegan", "Spicy", "Gluten-free"]],
  ["Desserts", "Olive oil cake", "Orange zest, mascarpone, a pinch of sea salt.", 8, ["Vegetarian"]],
  ["Desserts", "Dark chocolate pot", "Rich chocolate cream with sea salt and cocoa nibs.", 9, ["Vegetarian", "Gluten-free"]],
  ["Desserts", "Poached pear", "Spiced pear with coconut cream.", 8, ["Vegetarian", "Vegan", "Gluten-free"]],
  ["Drinks", "Fresh mint lemonade", "Pressed lemon, mint and a little sugar.", 5, ["Vegetarian", "Vegan", "Gluten-free"]],
  ["Drinks", "Flat white", "Double shot, silky steamed milk.", 4, ["Vegetarian", "Gluten-free"]],
  ["Drinks", "Spiced chai", "House-blended spices, black tea, milk.", 4.5, ["Vegetarian", "Gluten-free"]],
  ["Drinks", "House red, glass", "Smooth and fruity, from a small family vineyard.", 9, ["Vegetarian", "Vegan", "Gluten-free"]],
].map((r, i) => ({
  id: "m" + i,
  cat: r[0],
  name: r[1],
  desc: r[2],
  price: r[3],
  tags: r[4],
}));

const TIPS = [0, 10, 15, 20];

const $id = (i) => document.getElementById(i);

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const money = (n) => "$" + n.toFixed(2);

const state = {
  cat: "All",
  diets: new Set(),
  order: new Map(),
  tip: 10,
  split: 1,
};

// Menu filters
function renderFilters() {
  $id("cats").innerHTML = ["All"]
    .concat(CATS)
    .map(
      (c) =>
        `<button type="button" class="chip" data-cat="${c}" ` +
        `aria-pressed="${c === state.cat}">${c}</button>`,
    )
    .join("");

  $id("diets").innerHTML = DIETS.map(
    (d) =>
      `<button type="button" class="chip" data-diet="${d}" ` +
      `aria-pressed="${state.diets.has(d)}">${d}</button>`,
  ).join("");
}

$id("cats").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  state.cat = btn.dataset.cat;
  renderFilters();
  renderMenu();
});

$id("diets").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-diet]");
  if (!btn) return;
  const d = btn.dataset.diet;
  if (state.diets.has(d)) state.diets.delete(d);
  else state.diets.add(d);
  renderFilters();
  renderMenu();
});

// Menu list
function renderMenu() {
  const list = MENU.filter(
    (m) =>
      (state.cat === "All" || m.cat === state.cat) &&
      [...state.diets].every((d) => m.tags.includes(d)),
  );

  if (!list.length) {
    $id("menu").innerHTML =
      '<div class="empty">Nothing matches those filters. Try removing one.</div>';
    return;
  }

  $id("menu").innerHTML = list
    .map((m) => {
      const q = state.order.get(m.id) || 0;
      const act = q
        ? `<div class="qty"><button type="button" data-dec="${m.id}" aria-label="Remove one ${m.name}">−</button>` +
          `<b>${q}</b><button type="button" data-inc="${m.id}" aria-label="Add one ${m.name}">+</button></div>`
        : `<button type="button" class="btn add" data-inc="${m.id}">Add</button>`;
      return (
        `<div class="item"><h3>${m.name}</h3><div class="price">${money(m.price)}</div>` +
        `<p>${m.desc}</p>` +
        `<div class="tags">${m.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` +
        `<div class="act">${act}</div></div>`
      );
    })
    .join("");
}

function change(id, delta) {
  const q = (state.order.get(id) || 0) + delta;
  if (q <= 0) state.order.delete(id);
  else state.order.set(id, q);
  renderMenu();
  renderOrder();
}

function handleQty(e) {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  if (inc) change(inc.dataset.inc, 1);
  if (dec) change(dec.dataset.dec, -1);
}

$id("menu").addEventListener("click", handleQty);
$id("lines").addEventListener("click", handleQty);

// Order panel
function totals() {
  let sub = 0;
  state.order.forEach((q, id) => {
    sub += q * MENU.find((m) => m.id === id).price;
  });
  const tip = (sub * state.tip) / 100;
  return { sub, tip, total: sub + tip };
}

function renderOrder() {
  const lines = [...state.order.entries()].map(([id, q]) => {
    const m = MENU.find((x) => x.id === id);
    return (
      `<div class="row"><span>${q} × ${m.name}</span>` +
      `<span class="qty"><button type="button" data-dec="${id}" aria-label="Remove one ${m.name}">−</button>` +
      `<button type="button" data-inc="${id}" aria-label="Add one ${m.name}">+</button></span></div>`
    );
  });

  $id("lines").innerHTML = lines.length
    ? lines.join("")
    : '<p class="note">Add dishes from the menu to see your total.</p>';

  const t = totals();
  $id("sub").textContent = money(t.sub);
  $id("tipamt").textContent = money(t.tip);
  $id("total").textContent = money(t.total);
  $id("each").textContent = money(t.total / state.split);

  $id("tips").innerHTML = TIPS.map(
    (p) =>
      `<button type="button" class="chip" data-tip="${p}" ` +
      `aria-pressed="${p === state.tip}">${p}%</button>`,
  ).join("");
}

$id("tips").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tip]");
  if (!btn) return;
  state.tip = Number(btn.dataset.tip);
  renderOrder();
});

$id("split").addEventListener("input", (e) => {
  state.split = Number(e.target.value);
  renderOrder();
});

// Reservation form
const DATES = [];
for (let k = 0; k < 7; k++) {
  const d = new Date();
  d.setDate(d.getDate() + k);
  DATES.push(
    d.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
}
$id("rd").innerHTML = DATES.map((d) => `<option>${d}</option>`).join("");

const TIMES = [
  "12:00 pm",
  "12:30 pm",
  "1:00 pm",
  "1:30 pm",
  "5:30 pm",
  "6:00 pm",
  "6:30 pm",
  "7:00 pm",
  "7:30 pm",
  "8:00 pm",
  "8:30 pm",
];
$id("rt").innerHTML = TIMES.map((t) => `<option>${t}</option>`).join("");
$id("rt").value = "7:00 pm";

$id("rf").onsubmit = (e) => {
  e.preventDefault();

  if ($id("nm").value.trim().length < 2) {
    $id("err").textContent = "Please enter your name.";
    $id("nm").focus();
    return;
  }

  const g = $id("rg").value;
  const items = [...state.order.values()].reduce((s, q) => s + q, 0);
  const pre =
    $id("pre").checked && items
      ? ` Your pre-order of ${items} item${items > 1 ? "s" : ""} (${money(totals().total)}) is attached.`
      : "";

  $id("done").innerHTML =
    `<div class="ok" role="status">Thank you, ${esc($id("nm").value)}. ` +
    `A table for ${g} is held for ${$id("rd").value} at ${$id("rt").value}.${pre} ` +
    `We’ll email ${esc($id("em").value)} to confirm. ` +
    `(Demo: no message was sent.)</div>`;

  $id("rf").hidden = true;
  $id("done").scrollIntoView();
};

$id("rf").addEventListener("input", () => {
  $id("err").textContent = "";
});

renderFilters();
renderMenu();
renderOrder();