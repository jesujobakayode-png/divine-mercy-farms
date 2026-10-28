import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const pages = ["Dashboard", "Flocks", "Egg Production", "Sales", "Customers", "Expenses"];

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;
const dateForInput = (value = new Date()) => new Date(value).toISOString().slice(0, 10);

function request(path, options = {}) {
  const token = localStorage.getItem("dmf_token");
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  });
}

function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "Divine Mercy Farms" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = register ? "/auth/register" : "/auth/login";
      const data = await request(endpoint, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("dmf_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#edf1e7] p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-green-950/10">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d6edb5] text-3xl">🌱</div>
          <h1 className="mt-4 text-2xl font-bold text-[#183d2b]">Divine Mercy Farms</h1>
          <p className="mt-1 text-sm text-[#738273]">Farm management workspace</p>
        </div>
        {register && (
          <input className="field mb-3" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        )}
        {register && (
          <input className="field mb-3" placeholder="Farm name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        )}
        <input className="field mb-3" type="email" placeholder="Email address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="field" type="password" placeholder="Password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#28583b] px-4 py-3 font-semibold text-white hover:bg-[#183d2b] disabled:opacity-60">
          {loading ? "Please wait…" : register ? "Create account" : "Sign in"}
        </button>
        <button type="button" onClick={() => setRegister(!register)} className="mt-4 w-full text-sm font-medium text-[#28583b]">
          {register ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}

function Stat({ label, value, detail, icon }) {
  return <div className="rounded-2xl border border-[#e8ebdf] bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4"><p className="text-sm text-[#738273]">{label}</p><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e6] text-xl">{icon}</span></div>
    <p className="mt-5 text-3xl font-bold text-[#183d2b]">{value}</p><p className="mt-2 text-xs text-[#89958a]">{detail}</p>
  </div>;
}

function Dashboard({ setPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { request("/dashboard").then(setData).catch((err) => setError(err.message)); }, []);
  return <>
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#28583b] p-7 text-white sm:p-8">
      <div className="relative z-10 max-w-xl"><p className="text-sm font-medium text-[#d6edb5]">YOUR FARM AT A GLANCE</p><h3 className="mt-3 text-3xl font-bold">Better records.<br />Healthier growth.</h3><p className="mt-3 max-w-md text-sm leading-6 text-green-100">Track flocks, egg production, sales and expenses in one workspace.</p><button onClick={() => setPage("Egg Production")} className="mt-6 rounded-xl bg-[#d6edb5] px-5 py-3 text-sm font-semibold text-[#183d2b]">Record egg production →</button></div>
      <div className="pointer-events-none absolute -right-4 -top-10 text-[190px] opacity-15">🌿</div>
    </section>
    {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Today's Egg Production" value={data ? `${data.today.production.crates || 0} crates` : "—"} detail={`${data?.today.production.extraEggs || 0} extra eggs`} icon="🥚" />
      <Stat label="Active Flocks" value={data ? data.farm.activeFlocks : "—"} detail={`${data?.farm.totalBirds || 0} birds on the farm`} icon="🐔" />
      <Stat label="Today's Revenue" value={data ? money(data.today.salesRevenue) : "—"} detail="Sales recorded today" icon="₦" />
      <Stat label="Today's Expenses" value={data ? money(data.today.expenses) : "—"} detail="Expenses recorded today" icon="↘" />
    </div>
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
      <section className="rounded-2xl border border-[#e8ebdf] bg-white p-6 lg:col-span-2"><h3 className="font-bold text-[#243629]">Monthly summary</h3><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-green-50 p-4"><p className="text-xs text-green-700">Sales</p><p className="mt-2 text-xl font-bold">{data ? money(data.month.salesRevenue) : "—"}</p></div><div className="rounded-xl bg-orange-50 p-4"><p className="text-xs text-orange-700">Expenses</p><p className="mt-2 text-xl font-bold">{data ? money(data.month.expenses) : "—"}</p></div><div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-700">Net</p><p className="mt-2 text-xl font-bold">{data ? money(data.month.net) : "—"}</p></div></div></section>
      <section className="rounded-2xl border border-[#e8ebdf] bg-white p-6"><h3 className="font-bold text-[#243629]">Quick actions</h3><div className="mt-5 space-y-3">{[["🐔", "Add a flock", "Flocks"], ["🥚", "Record eggs", "Egg Production"], ["🧾", "Record a sale", "Sales"], ["💰", "Add an expense", "Expenses"]].map(([icon, label, page]) => <button key={label} onClick={() => setPage(page)} className="flex w-full items-center gap-3 rounded-xl border border-[#edf0e7] p-3 text-left hover:bg-[#f6f9f1]"><span className="text-xl">{icon}</span><span className="flex-1 text-sm font-medium">{label}</span><span>→</span></button>)}</div></section>
    </div>
  </>;
}

const configs = {
  Flocks: { endpoint: "/flocks", title: "Flocks", fields: [
    ["name", "Flock name", "text"], ["type", "Type", "select", ["layers", "broilers", "other"]], ["breed", "Breed", "text"], ["arrivalDate", "Arrival date", "date"], ["initialQuantity", "Bird count", "number"], ["status", "Status", "select", ["active", "sold_out", "depleted", "archived"]]
  ] },
  "Egg Production": { endpoint: "/production", title: "Egg Production", fields: [
    ["date", "Date", "date"], ["goodCrates", "Good crates", "number"], ["extraEggs", "Extra eggs", "number"], ["brokenEggs", "Broken eggs", "number"], ["notes", "Notes", "text"]
  ], relation: "flockId" },
  Sales: { endpoint: "/sales", title: "Sales", fields: [
    ["date", "Date", "date"], ["product", "Product", "select", ["eggs", "birds", "manure", "other"]], ["quantity", "Quantity", "number"], ["unit", "Unit", "text"], ["unitPrice", "Unit price", "number"], ["totalAmount", "Total amount", "number"], ["notes", "Notes", "text"]
  ], relations: ["customerId", "flockId"] },
  Customers: { endpoint: "/customers", title: "Customers", fields: [
    ["name", "Customer name", "text"], ["phone", "Phone", "text"], ["address", "Address", "text"], ["type", "Type", "select", ["individual", "retailer", "restaurant", "distributor", "other"]], ["status", "Status", "select", ["active", "inactive"]]
  ] },
  Expenses: { endpoint: "/expenses", title: "Expenses", fields: [
    ["date", "Date", "date"], ["category", "Category", "select", ["feed", "medication", "labor", "utilities", "transport", "repairs", "equipment", "other"]], ["description", "Description", "text"], ["totalAmount", "Amount", "number"], ["supplier", "Supplier", "text"], ["paymentMethod", "Payment method", "select", ["cash", "transfer", "pos", "credit", "other"]]
  ], relation: "flockId" },
};

function Records({ page }) {
  const config = configs[page];
  const defaults = Object.fromEntries(config.fields.map(([key, , type]) => [key, type === "date" ? dateForInput() : type === "number" ? "0" : ""]));
  const [items, setItems] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(defaults);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = async () => { try { const data = await request(config.endpoint); setItems(data.items || []); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); if (config.relation || config.relations) request("/flocks?status=active").then((d) => setFlocks(d.items || [])); if (config.relations?.includes("customerId")) request("/customers").then((d) => setCustomers(d.items || [])); }, [page]);

  const submit = async (event) => {
    event.preventDefault(); setError("");
    const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
    config.fields.filter(([, , type]) => type === "number").forEach(([key]) => { body[key] = Number(body[key] || 0); });
    try { await request(config.endpoint, { method: "POST", body: JSON.stringify(body) }); setOpen(false); setForm(defaults); load(); } catch (err) { setError(err.message); }
  };
  const remove = async (id) => { if (!window.confirm("Delete this record?")) return; await request(`${config.endpoint}/${id}`, { method: "DELETE" }); load(); };
  const title = (item) => item.name || item.description || `${item.product || "Egg collection"}${item.date ? ` — ${new Date(item.date).toLocaleDateString()}` : ""}`;

  return <section><div className="mb-6 flex items-center justify-between gap-4"><div><h3 className="text-xl font-bold text-[#183d2b]">{config.title}</h3><p className="mt-1 text-sm text-[#738273]">{items.length} record{items.length === 1 ? "" : "s"}</p></div><button onClick={() => setOpen(!open)} className="rounded-xl bg-[#28583b] px-4 py-3 text-sm font-semibold text-white">{open ? "Cancel" : `Add ${config.title === "Egg Production" ? "production" : config.title.slice(0, -1).toLowerCase()}`}</button></div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {open && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-[#e8ebdf] bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
      {(config.relation || config.relations || []).constructor === Array && config.relations?.includes("customerId") && <label className="form-label">Customer<select className="field" required value={form.customerId || ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}
      {(config.relation || config.relations) && <label className="form-label">Flock<select className="field" value={form.flockId || ""} onChange={(e) => setForm({ ...form, flockId: e.target.value })}><option value="">No flock / optional</option>{flocks.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}
      {config.fields.map(([key, label, type, choices]) => <label className="form-label" key={key}>{label}{type === "select" ? <select className="field" value={form[key] || choices[0]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>{choices.map((choice) => <option key={choice} value={choice}>{choice.replaceAll("_", " ")}</option>)}</select> : <input className="field" type={type} required={key !== "notes" && key !== "breed" && key !== "supplier" && key !== "address"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}</label>)}
      <button className="self-end rounded-xl bg-[#28583b] px-5 py-3 font-semibold text-white sm:col-span-2 lg:col-span-3">Save record</button>
    </form>}
    <div className="overflow-hidden rounded-2xl border border-[#e8ebdf] bg-white">
      {!items.length ? <div className="p-10 text-center text-sm text-[#738273]">No records yet. Add the first one above.</div> : <div className="divide-y divide-[#edf0e7]">{items.map((item) => <div key={item._id} className="flex items-center gap-4 p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4e6] text-xl">{page === "Flocks" ? "🐔" : page === "Egg Production" ? "🥚" : page === "Sales" ? "🧾" : page === "Customers" ? "♙" : "₦"}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#354b38]">{title(item)}</p><p className="mt-1 text-xs text-[#738273]">{item.date ? new Date(item.date).toLocaleDateString() : item.type || item.status || item.category || ""}{item.totalAmount != null ? ` • ${money(item.totalAmount)}` : item.initialQuantity != null ? ` • ${item.initialQuantity} birds` : ""}</p></div><button onClick={() => remove(item._id)} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button></div>)}</div>}
    </div>
  </section>;
}

export default function FarmApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => { const token = localStorage.getItem("dmf_token"); if (token) request("/auth/me").then((data) => setUser(data.user)).catch(() => localStorage.removeItem("dmf_token")).finally(() => setChecking(false)); else setChecking(false); }, []);
  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f7f8f2]"><p className="font-semibold text-[#28583b]">Loading Divine Mercy Farms…</p></main>;
  if (!user) return <Login onLogin={setUser} />;
  const logout = () => { localStorage.removeItem("dmf_token"); setUser(null); };
  const pageIcons = { Dashboard: "⌂", Flocks: "🐔", "Egg Production": "🥚", Sales: "↗", Customers: "♙", Expenses: "₦" };
  const navigate = (nextPage) => { setPage(nextPage); setMobileMenu(false); };
  return <div className="min-h-screen bg-[#f7f8f2] md:flex">
    {mobileMenu && <button aria-label="Close navigation" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-40 bg-[#102318]/50 backdrop-blur-sm lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[280px] max-w-[85vw] flex-col overflow-hidden bg-[#183d2b] text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5 lg:px-6 lg:py-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d6edb5] text-2xl">🌱</div><div className="min-w-0 flex-1"><h1 className="font-bold tracking-wide">Divine Mercy</h1><p className="text-[10px] font-semibold tracking-[0.16em] text-green-200">FARMS MANAGEMENT</p></div><button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xl lg:hidden">×</button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/80">Farm workspace</p>
        <nav className="flex flex-col space-y-1.5">{pages.map((name) => <button key={name} onClick={() => navigate(name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 ${page === name ? "bg-[#d6edb5] font-semibold text-[#183d2b] shadow-sm" : "text-green-50 hover:bg-white/10 hover:text-white"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${page === name ? "bg-white/40" : "bg-white/5"}`}>{pageIcons[name]}</span><span>{name}</span>{page === name && <span className="ml-auto text-[#4f7738]">›</span>}</button>)}</nav>
      </div>
      <div className="shrink-0 border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 rounded-xl px-1"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6edb5] font-bold text-[#183d2b]">{user.name?.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs text-green-200">Farm Administrator</p></div></div><button onClick={logout} className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">Sign out</button></div>
    </aside>
    <main className="min-w-0 flex-1 lg:ml-64">
      <header className="sticky top-0 z-30 mb-0 flex items-center justify-between gap-3 border-b border-[#e5e9dc] bg-[#f7f8f2]/95 px-4 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:px-9 lg:pb-6 lg:pt-9">
        <button aria-label="Open navigation" onClick={() => setMobileMenu(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfe5d7] bg-white text-xl text-[#183d2b] shadow-sm lg:hidden">☰</button>
        <div className="min-w-0 flex-1"><p className="hidden text-sm text-[#738273] sm:block">Farm workspace / {page}</p><h2 className="truncate text-xl font-bold text-[#183d2b] sm:mt-2 sm:text-2xl lg:text-3xl">{page === "Dashboard" ? `Good morning, ${user.name?.split(" ")[0]} 👋` : page}</h2></div><div className="hidden rounded-2xl border border-[#e5e9dc] bg-white px-4 py-3 text-right sm:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-[#738273]">Farm Admin</p></div>
      </header>
      <div className="p-4 sm:p-6 lg:px-9 lg:pb-9">
        {page === "Dashboard" ? <Dashboard setPage={navigate} /> : <Records page={page} />}
      </div>
    </main>
  </div>;
}
