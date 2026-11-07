import { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "https://divine-mercy-farms-api.onrender.com/api");
const pages = ["Dashboard", "Flocks", "Egg Production", "Mortality", "Inventory", "Sales", "Payments", "Customers", "Feed & Medication", "Expenses", "Reports"];

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
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative mb-1">
          <input className="field pr-14" type={showPassword ? "text" : "password"} placeholder="Password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-lg text-[#738273]">{showPassword ? "◉" : "○"}</button>
        </div>
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
  const [analytics, setAnalytics] = useState({ production: [], sales: [], expenses: [], flocks: [] });
  useEffect(() => {
    request("/dashboard").then(setData).catch((err) => setError(err.message));
    Promise.all([request("/production"), request("/sales"), request("/expenses"), request("/flocks")])
      .then(([production, sales, expenses, flocks]) => {
        const recent = (items) => [...(items || [])].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 7).reverse();
        const chartItems = (items) => recent(items).map((item) => ({
          label: new Date(item.date || item.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
          value: Number(item.totalAmount || item.goodCrates || 0),
        }));
        setAnalytics({
          production: recent(production.items).map((item) => ({ label: new Date(item.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }), value: Number(item.goodCrates || 0) + Number(item.extraEggs || 0) / 30 })),
          sales: chartItems(sales.items),
          expenses: chartItems(expenses.items),
          flocks: ["active", "sold_out", "culling", "other"].map((status, index) => ({ label: status.replaceAll("_", " "), value: (flocks.items || []).filter((item) => (item.status || "active") === status).length, color: ["#28583b", "#d6a64f", "#d97757", "#9ca3af"][index] })),
        });
      })
      .catch((err) => setError(err.message));
  }, []);
  return <>
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#28583b] p-7 text-white sm:p-8">
      <div className="relative z-10 max-w-xl"><p className="text-sm font-medium text-[#d6edb5]">YOUR FARM AT A GLANCE</p><h3 className="mt-3 text-3xl font-bold">Better records.<br />Healthier growth.</h3><p className="mt-3 max-w-md text-sm leading-6 text-green-100">Track flocks, egg production, sales and expenses in one workspace.</p><button onClick={() => setPage("Egg Production")} className="mt-6 rounded-xl bg-[#d6edb5] px-5 py-3 text-sm font-semibold text-[#183d2b]">Record egg production →</button></div>
      <div className="pointer-events-none absolute -right-4 -top-10 text-[190px] opacity-15">🌿</div>
    </section>
    {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Today's Egg Production" value={data ? `${data.today.production.crates || 0} crates` : "—"} detail={`${data?.today.production.extraEggs || 0} extra pieces`} icon="🥚" />
      <Stat label="Active Flocks" value={data ? data.farm.activeFlocks : "—"} detail={`${data?.farm.totalBirds || 0} birds on the farm`} icon="🐔" />
      <Stat label="Today's Revenue" value={data ? money(data.today.salesRevenue) : "—"} detail="Sales recorded today" icon="₦" />
      <Stat label="Today's Expenses" value={data ? money(data.today.expenses) : "—"} detail="Expenses recorded today" icon="↘" />
    </div>
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#e8ebdf] bg-white p-4 sm:p-6"><h3 className="font-bold text-[#243629]">Sales trend</h3><p className="mt-1 text-xs text-[#738273]">Latest sales in naira</p><div className="mt-5"><BarChart data={analytics.sales} color="#28583b" /></div></section>
      <section className="rounded-2xl border border-[#e8ebdf] bg-white p-4 sm:p-6"><h3 className="font-bold text-[#243629]">Expense trend</h3><p className="mt-1 text-xs text-[#738273]">Latest expenses in naira</p><div className="mt-5"><BarChart data={analytics.expenses} color="#d97757" /></div></section>
    </div>
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="page-panel rounded-2xl border border-[#e8ebdf] bg-white p-4 sm:p-6">
        <h3 className="font-bold text-[#243629]">Egg production trend</h3>
        <p className="mt-1 text-xs text-[#738273]">Latest recorded production</p>
        <div className="mt-5"><BarChart data={analytics.production} color="#d0a85c" /></div>
      </section>
      <section className="page-panel rounded-2xl border border-[#e8ebdf] bg-white p-4 sm:p-6">
        <h3 className="font-bold text-[#243629]">Flock standing</h3>
        <p className="mt-1 text-xs text-[#738273]">Current records by status</p>
        <div className="mt-5"><Donut items={analytics.flocks} /></div>
      </section>
    </div>
  </>;
}

const configs = {
  Flocks: { endpoint: "/flocks", title: "Flocks", fields: [
    ["name", "Flock name", "text"], ["type", "Type", "select", ["layers", "broilers", "noilers", "other"]], ["breed", "Breed", "text"], ["arrivalDate", "Arrival date", "date"], ["initialQuantity", "Bird count", "number"], ["source", "Source", "text"], ["status", "Status", "select", ["active", "sold_out", "culling", "other"]], ["notes", "Notes", "text"]
  ] },
  "Egg Production": { endpoint: "/production", title: "Egg Production", fields: [
    ["date", "Date", "date"], ["goodCrates", "Good crates", "number"], ["extraEggs", "Extra pieces", "number"], ["brokenEggs", "Cracks", "number"], ["notes", "Notes", "text"]
  ], relation: "flockId" },
  Sales: { endpoint: "/sales", title: "Sales", fields: [
    ["date", "Date", "date"], ["product", "What was sold", "select", ["eggs", "birds", "manure", "other"]], ["quantity", "Quantity", "number"], ["totalAmount", "Sale amount", "number"], ["notes", "Notes", "text"]
  ], relations: ["customerId", "flockId"] },
  Customers: { endpoint: "/customers", title: "Customers", fields: [
    ["name", "Customer name", "text"], ["phone", "Phone", "text"], ["address", "Address", "text"], ["type", "Type", "select", ["individual", "retailer", "restaurant", "distributor", "other"]], ["status", "Status", "select", ["active", "inactive"]]
  ] },
  Expenses: { endpoint: "/expenses", title: "Expenses", fields: [
    ["date", "Date", "date"], ["category", "Expense type", "select", ["labor", "utilities", "transport", "repairs", "equipment", "other"]], ["description", "Description", "text"], ["totalAmount", "Cost (₦)", "number"]
  ], relation: "flockId" },
  Mortality: { endpoint: "/mortalities", title: "Mortality Records", fields: [
    ["date", "Date", "date"], ["quantity", "Birds lost", "number"], ["reason", "Reason", "select", ["unknown", "illness", "accident", "natural", "other"]], ["notes", "Notes", "text"]
  ], relation: "flockId" },
  Payments: { endpoint: "/payments", title: "Customer Payments", fields: [
    ["date", "Date", "date"], ["purpose", "Payment for", "text"], ["amount", "Amount paid", "number"], ["method", "Payment method", "select", ["cash", "transfer", "pos", "other"]], ["notes", "Notes", "text"]
  ], relations: ["customerId"] },
  "Feed & Medication": { endpoint: "/expenses", title: "Feed & Medication", fields: [
    ["date", "Date", "date"], ["category", "Type", "select", ["feed", "medication"]], ["description", "Feed / medication name", "text"], ["quantity", "Number of bags", "number"], ["totalAmount", "Cost (₦)", "number"]
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
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const notify = useToast();

  useEffect(() => {
    if (page === "Sales" && form.quantity && form.unitPrice) {
      const total = Number(form.quantity || 0) * Number(form.unitPrice || 0);
      if (Number(form.totalAmount) !== total) setForm((current) => ({ ...current, totalAmount: String(total) }));
    }
  }, [page, form.quantity, form.unitPrice, form.totalAmount]);

  const load = async () => {
    try {
      const data = await request(config.endpoint);
      const records = data.items || [];
      if (page === "Expenses") setItems(records.filter((item) => !["feed", "medication"].includes(item.category)));
      else if (page === "Feed & Medication") setItems(records.filter((item) => ["feed", "medication"].includes(item.category)));
      else setItems(records);
    } catch (err) { setError(err.message); }
  };
  // Reload records when their page changes; API requests are intentionally handled outside render state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); if (config.relation || config.relations) request("/flocks?status=active").then((d) => setFlocks(d.items || [])); if (config.relations?.includes("customerId")) request("/customers").then((d) => setCustomers(d.items || [])); }, [page]);

  const toForm = (item) => Object.fromEntries(config.fields.map(([key, , type]) => {
    const value = item[key];
    return [key, type === "date" && value ? String(value).slice(0, 10) : value ?? (type === "number" ? 0 : "")];
  }).concat([
    ["flockId", item.flockId?._id || item.flockId || ""],
    ["customerId", item.customerId?._id || item.customerId || ""],
  ]));

  const submit = async (event) => {
    event.preventEvent?.();
    event.preventDefault(); setError("");
    const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
    config.fields.filter(([, , type]) => type === "number").forEach(([key]) => { body[key] = Number(body[key] || 0); });
    if (page === "Sales") {
      body.unit = body.product === "eggs" ? "pieces" : "units";
      body.unitPrice = Number(body.quantity || 0) ? Number(body.totalAmount || 0) / Number(body.quantity || 0) : 0;
    }
    if (page === "Expenses" || page === "Feed & Medication") {
      body.quantity = page === "Feed & Medication" && body.category === "feed" ? Number(body.quantity || 0) : 1;
      body.unit = body.category === "feed" ? "bags" : "item";
      body.unitCost = Number(body.totalAmount || 0);
    }
    try {
      await request(editing ? `${config.endpoint}/${selected._id}` : config.endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
      notify(editing ? "Record updated successfully." : "Record saved successfully.");
      setOpen(false);
      setSelected(null);
      setEditing(false);
      setForm(defaults);
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await request(`${config.endpoint}/${id}`, { method: "DELETE" }); setSelected(null); load(); notify("Delete successful"); } catch (err) { setError(err.message); }
  };

  const preview = (item) => { setSelected(item); setEditing(false); };
  const startEdit = (item) => { setSelected(item); setForm(toForm(item)); setEditing(true); };
  const closeModal = () => { setSelected(null); setEditing(false); setForm(defaults); };
  const title = (item) => item.name || item.description || `${item.product || "Egg collection"}${item.date ? ` — ${new Date(item.date).toLocaleDateString()}` : ""}`;
  const value = (item, key) => key === "date" || key === "arrivalDate" ? (item[key] ? new Date(item[key]).toLocaleDateString() : "—") : item[key] ?? "—";

  return <section><div className="mb-6 flex items-center justify-between gap-4"><div><h3 className="text-xl font-bold text-[#183d2b]">{config.title}</h3><p className="mt-1 text-sm text-[#738273]">{items.length} record{items.length === 1 ? "" : "s"}</p></div><button onClick={() => { setEditing(false); setSelected(null); setForm(defaults); setOpen(!open); }} className="rounded-xl bg-[#28583b] px-4 py-3 text-sm font-semibold text-white">{open ? "Cancel" : `Add ${config.title === "Egg Production" ? "production" : config.title.slice(0, -1).toLowerCase()}`}</button></div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {open && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-[#e8ebdf] bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
      {(config.relation || config.relations) && config.relations?.includes("customerId") && <label className="form-label">Customer<select className="field" required value={form.customerId || ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}
      {(config.relation || config.relations) && <label className="form-label">Flock<select className="field" value={form.flockId || ""} onChange={(e) => setForm({ ...form, flockId: e.target.value })}><option value="">No flock / optional</option>{flocks.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}
      {config.fields.map((field) => <RecordField key={field[0]} field={field} form={form} setForm={setForm} showPlaceholder />)}
      <button className="self-end rounded-xl bg-[#28583b] px-5 py-3 font-semibold text-white sm:col-span-2 lg:col-span-3">Save record</button>
    </form>}

    {page === "Egg Production" && items.length > 0 && <div className="mb-6 overflow-hidden rounded-2xl border border-[#e8ebdf] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf0e7] px-5 py-4"><div><h4 className="font-bold text-[#243629]">Daily production sheet</h4><p className="mt-1 text-xs text-[#738273]">Essential daily details</p></div><span className="rounded-full bg-[#edf4e6] px-3 py-1 text-xs font-semibold text-[#28583b]">{items.length} days</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f6f8f2] text-xs uppercase tracking-wide text-[#738273]"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Flock</th><th className="px-5 py-3">Good crates</th><th className="px-5 py-3">Extra pieces</th><th className="px-5 py-3">Cracks</th><th className="px-5 py-3">Notes</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-[#edf0e7]">{[...items].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item) => <tr key={item._id} className="cursor-pointer hover:bg-[#fafcf7]" onClick={() => preview(item)}><td className="px-5 py-3 font-medium text-[#354b38]">{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td><td className="px-5 py-3">{item.flockId?.name || "—"}</td><td className="px-5 py-3">{item.goodCrates ?? 0}</td><td className="px-5 py-3">{item.extraEggs ?? 0}</td><td className="px-5 py-3">{item.brokenEggs ?? 0}</td><td className="max-w-[220px] truncate px-5 py-3 text-[#738273]">{item.notes || "—"}</td><td className="px-5 py-3"><button className="text-[#28583b]" onClick={(event) => { event.stopPropagation(); preview(item); }}>View</button></td></tr>)}</tbody></table></div>
    </div>}

    <div className="overflow-hidden rounded-2xl border border-[#e8ebdf] bg-white">
      {!items.length ? <div className="p-10 text-center text-sm text-[#738273]">No records yet. Add the first one above.</div> : <div className="divide-y divide-[#edf0e7]">{items.map((item) => <div key={item._id} onClick={() => preview(item)} className="flex cursor-pointer items-center gap-4 p-4 transition hover:bg-[#fafcf7]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4e6] text-xl">{page === "Flocks" ? "🐔" : page === "Egg Production" ? "🥚" : page === "Sales" ? "🧾" : page === "Customers" ? "♙" : "₦"}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#354b38]">{title(item)}</p><p className="mt-1 text-xs text-[#738273]">{item.date ? new Date(item.date).toLocaleDateString() : item.type || item.status || item.category || ""}{item.totalAmount != null ? ` • ${money(item.totalAmount)}` : item.initialQuantity != null ? ` • ${item.initialQuantity} birds` : ""}</p></div><button onClick={(event) => { event.stopPropagation(); startEdit(item); }} className="rounded-lg px-3 py-2 text-sm font-medium text-[#28583b] hover:bg-[#edf4e6]">Edit</button><button onClick={(event) => { event.stopPropagation(); remove(item._id); }} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button></div>)}</div>}
    </div>

    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102819]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#edf0e7] px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-widest text-[#738273]">{editing ? "Edit record" : "Record details"}</p><h3 className="mt-1 text-xl font-bold text-[#183d2b]">{editing ? `Update ${config.title.toLowerCase()}` : title(selected)}</h3></div><button onClick={closeModal} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f4ed] text-xl text-[#738273]">×</button></div>
      {editing ? (
        <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
          {config.relations?.includes("customerId") && (
            <label className="form-label">
              Customer
              <select className="field" required value={form.customerId || ""} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                <option value="">Select customer</option>
                {customers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </label>
          )}
          {(config.relation || config.relations) && (
            <label className="form-label">
              Flock
              <select className="field" value={form.flockId || ""} onChange={(event) => setForm({ ...form, flockId: event.target.value })}>
                <option value="">No flock / optional</option>
                {flocks.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </label>
          )}
          {config.fields.map((field) => <RecordField key={field[0]} field={field} form={form} setForm={setForm} />)}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={closeModal} className="rounded-xl border border-[#dfe4d8] px-5 py-3 font-semibold text-[#354b38]">Cancel</button>
            <button className="rounded-xl bg-[#28583b] px-5 py-3 font-semibold text-white">Save changes</button>
          </div>
        </form>
      ) : (
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {config.fields.map(([key, label]) => (
              <div key={key} className="rounded-xl bg-[#f6f8f2] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#738273]">{label}</p>
                <p className="mt-2 break-words font-semibold text-[#354b38]">{key === "notes" && !selected[key] ? "—" : value(selected, key)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => remove(selected._id)} className="rounded-xl px-5 py-3 font-semibold text-red-600 hover:bg-red-50">Delete</button>
            <button onClick={() => startEdit(selected)} className="rounded-xl bg-[#28583b] px-5 py-3 font-semibold text-white">Edit record</button>
          </div>
        </div>
      )}
    </div></div>}
  </section>;
}

function Splash({ onComplete }) {
  return (
    <main className="splash-screen relative grid min-h-[100dvh] overflow-hidden bg-[#183d2b] text-white">
      <div className="splash-photo absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#102819]/95 via-[#183d2b]/80 to-[#183d2b]/30" />
      <div className="splash-glow absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#d6edb5]/20 blur-3xl" />
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between px-6 py-7 sm:px-10 sm:py-9 lg:px-16">
        <div className="flex items-center gap-3 splash-reveal">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-[#d6edb5] text-2xl text-[#183d2b] shadow-lg">🌱</div>
          <div>
            <p className="font-bold tracking-wide">Divine Mercy Farms</p>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#d6edb5]">FARM MANAGEMENT</p>
          </div>
        </div>

        <div className="max-w-xl pb-6">
          <p className="splash-reveal-delayed mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#d6edb5]">Good stewardship. Better growth.</p>
          <h1 className="splash-title text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Your farm,<br />in clear view.
          </h1>
          <p className="splash-reveal-delayed mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
            One calm workspace for your poultry, records, sales and everyday farm decisions.
          </p>
          <button onClick={onComplete} className="splash-button mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#d6edb5] px-5 py-3 font-semibold text-[#183d2b] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white">
            Enter farm workspace <span className="text-lg">→</span>
          </button>
        </div>

        <div className="splash-reveal-delayed flex items-center gap-3 text-xs text-white/60">
          <span className="h-px w-8 bg-[#d6edb5]" />
          Poultry · Livestock · Records
        </div>
      </div>
    </main>
  );
}

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const remove = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const icons = { success: "✓", error: "!", info: "i" };

  return <ToastContext.Provider value={notify}>
    {children}
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[360px]" aria-live="polite">
      {toasts.map((toast) => <div key={toast.id} className={`page-enter flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-green-950/15 ${toast.type === "error" ? "border-red-200" : "border-[#dfe5d7]"}`}>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white ${toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-blue-500" : "bg-[#28583b]"}`}>{icons[toast.type]}</span>
        <p className="flex-1 pt-1 text-sm font-semibold text-[#354b38]">{toast.message}</p>
        <button aria-label="Dismiss notification" onClick={() => remove(toast.id)} className="text-lg leading-none text-[#738273]">×</button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

function FarmAppContent() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem("dmf_splash_seen") !== "true");
  const finishSplash = () => { sessionStorage.setItem("dmf_splash_seen", "true"); setShowSplash(false); };
  useEffect(() => {
    const token = localStorage.getItem("dmf_token");
    if (token) request("/auth/me").then((data) => setUser(data.user)).catch(() => localStorage.removeItem("dmf_token")).finally(() => setChecking(false));
    else queueMicrotask(() => setChecking(false));
  }, []);
  if (showSplash) return <Splash onComplete={finishSplash} />;
  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f7f8f2]"><p className="font-semibold text-[#28583b]">Loading Divine Mercy Farms…</p></main>;
  if (!user) return <Login onLogin={setUser} />;
  const logout = () => { localStorage.removeItem("dmf_token"); setUser(null); };
  const pageIcons = { Dashboard: "⌂", Flocks: "🐔", Mortality: "✚", "Egg Production": "🥚", Inventory: "◫", Sales: "↗", Payments: "💳", Customers: "♙", Expenses: "₦", "Feed & Medication": "🌾", Reports: "▤" };
  const navigate = (nextPage) => { setPage(nextPage); setMobileMenu(false); };
  return <div className="min-h-screen bg-[#f7f8f2] md:flex">
    {mobileMenu && <button aria-label="Close navigation" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-40 bg-[#102318]/50 backdrop-blur-sm lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[280px] max-w-[85vw] flex-col overflow-hidden bg-[#183d2b] text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5 lg:px-6 lg:py-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d6edb5] text-2xl">🌱</div><div className="min-w-0 flex-1"><h1 className="font-bold tracking-wide">Divine Mercy</h1><p className="text-[10px] font-semibold tracking-[0.16em] text-green-200">FARMS MANAGEMENT</p></div><button aria-label="Close menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xl lg:hidden">×</button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/80">Farm workspace</p>
        <nav className="flex flex-col space-y-1.5">{pages.map((name) => <button key={name} onClick={() => navigate(name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 ${page === name ? "bg-[#d6edb5] font-semibold text-[#183d2b] shadow-sm" : "text-green-50 hover:bg-white/10 hover:text-white"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${page === name ? "bg-white/40" : "bg-white/5"}`}>{pageIcons[name]}</span><span>{name}</span>{page === name && <span className="ml-auto text-[#4f7738]">›</span>}</button>)}</nav>
      </div>
      <div className="shrink-0 border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 rounded-xl px-1"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6edb5] font-bold text-[#183d2b]">{user.name?.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs text-green-200">Farm Administrator</p></div></div><button onClick={logout} className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">Sign out</button></div>
    </aside>
    <main className="min-w-0 flex-1 lg:ml-64">
      <header className="sticky top-0 z-30 mb-0 flex items-center justify-between gap-3 border-b border-[#e5e9dc] bg-[#f7f8f2]/95 px-4 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:px-9 lg:pb-6 lg:pt-9">
        <button aria-label="Open navigation" onClick={() => setMobileMenu(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfe5d7] bg-white text-xl text-[#183d2b] shadow-sm lg:hidden">☰</button>
        <div className="min-w-0 flex-1"><p className="hidden text-sm text-[#738273] sm:block">Farm workspace / {page}</p><h2 className="truncate text-xl font-bold text-[#183d2b] sm:mt-2 sm:text-2xl lg:text-3xl">{page === "Dashboard" ? `${timeGreeting()}, ${user.name?.split(" ")[0]} 👋` : page}</h2></div><div className="hidden rounded-2xl border border-[#e5e9dc] bg-white px-4 py-3 text-right sm:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-[#738273]">Farm Admin</p></div>
      </header>
      <div className="p-4 sm:p-6 lg:px-9 lg:pb-9">
        <div className="page-enter">{page === "Dashboard" ? <Dashboard setPage={navigate} /> : page === "Inventory" ? <><h3 className="mb-5 text-xl font-bold text-[#183d2b]">Current inventory</h3><Inventory setPage={navigate} /></> : page === "Reports" ? <><h3 className="mb-5 text-xl font-bold text-[#183d2b]">Farm reports</h3><Reports /></> : <Records page={page} />}</div>
      </div>
    </main>
  </div>;
}

export default function FarmApp() {
  return <ToastProvider><FarmAppContent /></ToastProvider>;
}

function RecordField({ field, form, setForm, showPlaceholder = false }) {
  const [key, label, type, choices = []] = field;
  const optional = ["notes", "breed", "supplier", "address", "source", "purpose"].includes(key);
  const update = (value) => setForm((current) => ({ ...current, [key]: value }));

  let control;
  if (key === "unit" && form.product === "eggs") {
    control = <select className="field" required value={form[key] || ""} onChange={(event) => update(event.target.value)}><option value="" disabled>Select unit</option><option value="crates">Crates</option><option value="pieces">Pieces</option></select>;
  } else if (type === "select") {
    control = <select className="field" required value={form[key] || ""} onChange={(event) => update(event.target.value)}><option value="" disabled>{showPlaceholder ? `Select ${label.toLowerCase()}` : "Select"}</option>{choices.map((choice) => <option key={choice} value={choice}>{choice.replaceAll("_", " ")}</option>)}</select>;
  } else {
    control = <input className="field" type={type} required={!optional} placeholder={showPlaceholder && type !== "date" ? label : undefined} value={form[key] ?? ""} onChange={(event) => update(event.target.value)} />;
  }

  return <label className="form-label" key={key}>{label}{control}</label>;
}

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

function BarChart({ data, color = "#28583b", emptyLabel = "No data yet" }) {
  const max = Math.max(...data.map((point) => Number(point.value) || 0), 1);
  if (!data.length) return <p className="py-10 text-center text-sm text-[#738273]">{emptyLabel}</p>;
  return <div className="flex h-44 items-end gap-2 rounded-xl bg-[#fafbf7] px-3 pt-4 sm:gap-3">
    {data.map((point, index) => <div key={`${point.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
      <span className="text-[10px] font-semibold text-[#738273]">{Number(point.value || 0).toLocaleString()}</span>
      <div className="w-full max-w-10 rounded-t-md transition-all duration-700" style={{ height: `${Math.max(6, (Number(point.value || 0) / max) * 120)}px`, background: color }} />
      <span className="truncate text-[10px] text-[#738273]">{point.label}</span>
    </div>)}
  </div>;
}

function Donut({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 360 : 0;
    return `${item.color} ${start}deg ${cursor}deg`;
  }).join(", ");
  return <div className="flex flex-col items-center gap-5 sm:flex-row">
    <div className="grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background: total ? `conic-gradient(${stops})` : "#edf0e7" }}>
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><div><strong className="block text-xl text-[#183d2b]">{total}</strong><span className="text-[10px] text-[#738273]">total</span></div></div>
    </div>
    <div className="grid w-full gap-2">{items.map((item) => <div key={item.label} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="flex-1 text-[#738273]">{item.label}</span><strong>{item.value}</strong></div>)}</div>
  </div>;
}

function Inventory({ setPage }) {
  const [values, setValues] = useState({ crates: 0, pieces: 0, birds: 0, loading: true });
  useEffect(() => {
    let cancelled = false;
    const calculateInventory = async () => {
      try {
        const [production, sales, flocks, mortality] = await Promise.all([request("/production"), request("/sales"), request("/flocks"), request("/mortalities")]);
        if (cancelled) return;
        const activeFlocks = (flocks.items || []).filter((flock) => flock.status === "active");
        const activeFlockIds = new Set(activeFlocks.map((flock) => String(flock._id)));
        const relationId = (record) => String(record?.flockId?._id || record?.flockId || "");
        const producedCrates = (production.items || []).reduce((sum, item) => sum + Number(item.goodCrates || 0), 0);
        const extraPieces = (production.items || []).reduce((sum, item) => sum + Number(item.extraEggs || 0), 0);
        const crackedPieces = (production.items || []).reduce((sum, item) => sum + Number(item.brokenEggs || 0), 0);
        const eggSales = (sales.items || []).filter((item) => item.product === "eggs");
        const soldCrates = eggSales.filter((item) => String(item.unit).toLowerCase() === "crates").reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const soldPieces = eggSales.filter((item) => String(item.unit).toLowerCase() === "pieces").reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const availablePieces = Math.max(0, producedCrates * 30 + extraPieces - soldCrates * 30 - soldPieces - crackedPieces);
        const initialBirds = activeFlocks.reduce((sum, flock) => sum + Number(flock.initialQuantity || 0), 0);
        const lostBirds = (mortality.items || []).filter((item) => activeFlockIds.has(relationId(item))).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const soldBirds = (sales.items || []).filter((item) => item.product === "birds" && activeFlockIds.has(relationId(item))).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        setValues({ crates: Math.floor(availablePieces / 30), pieces: availablePieces % 30, birds: Math.max(0, initialBirds - lostBirds - soldBirds), loading: false });
      } catch {
        if (!cancelled) setValues((current) => ({ ...current, loading: false }));
      }
    };
    calculateInventory();
    const interval = window.setInterval(calculateInventory, 60000);
    window.addEventListener("focus", calculateInventory);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", calculateInventory); };
  }, []);
  return <div className="grid gap-4 sm:grid-cols-3">
    {[{ label: "Egg crates", value: values.loading ? "—" : values.crates, icon: "🥚" }, { label: "Loose pieces", value: values.loading ? "—" : values.pieces, icon: "●" }, { label: "Birds available", value: values.loading ? "—" : values.birds, icon: "🐔" }].map((item) => <div key={item.label} className="rounded-2xl border border-[#e8ebdf] bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#738273]">{item.label}</p><span>{item.icon}</span></div><p className="mt-4 text-3xl font-bold text-[#183d2b]">{item.value}</p><button onClick={() => setPage(item.label === "Birds available" ? "Flocks" : "Egg Production")} className="mt-4 text-sm font-semibold text-[#28583b]">View records →</button></div>)}
  </div>;
}

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const displayValue = (value) => {
    if (value == null || value === "") return "—";
    if (typeof value === "object") return value.name || value.description || value._id || "—";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString();
    return String(value);
  };

  const openPreview = async (endpoint, filename) => {
    setLoading(true);
    setError("");
    try {
      const data = await request(endpoint);
      const rows = data.items || [];
      const allKeys = rows.flatMap((item) => Object.keys(item).filter((key) => !key.startsWith("$")));
      const uniqueKeys = [...new Set(allKeys)];
      const ignoredKeys = ["businessId", "__v", "createdAt", "updatedAt"];
      const keys = uniqueKeys.filter((key) => !ignoredKeys.includes(key)).slice(0, 8);
      setPreview({ filename, rows, keys });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPreview = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [preview.keys.join(","), ...preview.rows.map((row) => preview.keys.map((key) => escape(displayValue(row[key]))).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = preview.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const reportFiles = [
    ["production", "Egg production report.csv"], ["sales", "Sales report.csv"], ["expenses", "Expenses report.csv"],
    ["flocks", "Flock report.csv"], ["mortalities", "Mortality report.csv"], ["payments", "Payments report.csv"],
  ];

  return <div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reportFiles.map(([endpoint, filename]) => (
        <button disabled={loading} key={endpoint} onClick={() => openPreview(`/${endpoint}`, filename)} className="rounded-2xl border border-[#e8ebdf] bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
          <span className="text-2xl">▤</span><p className="mt-4 font-bold text-[#243629]">{filename.replace(".csv", "")}</p><p className="mt-1 text-xs text-[#738273]">Preview and download CSV</p>
        </button>
      ))}
    </div>

    {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102819]/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0e7] px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#738273]">Report preview</p><h3 className="mt-1 font-bold text-[#183d2b]">{preview.filename.replace(".csv", "")}</h3></div><button aria-label="Close preview" onClick={() => setPreview(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f4ed] text-xl">×</button></div>
        <div className="max-h-[55vh] overflow-auto px-3 py-4 sm:px-6">
          {!preview.rows.length ? <p className="rounded-xl bg-[#f6f8f2] p-8 text-center text-sm text-[#738273]">No records to preview.</p> : <table className="w-full min-w-max border-collapse text-left text-xs sm:text-sm"><thead className="sticky top-0 bg-[#edf4e6] text-[#354b38]"><tr>{preview.keys.map((key) => <th key={key} className="border-b border-[#dfe5d7] px-3 py-3 font-semibold">{key.replace(/([A-Z])/g, " $1")}</th>)}</tr></thead><tbody>{preview.rows.slice(0, 100).map((row, index) => <tr key={row._id || index} className="border-b border-[#edf0e7]">{preview.keys.map((key) => <td key={key} className="max-w-[220px] px-3 py-3 text-[#738273]">{displayValue(row[key])}</td>)}</tr>)}</tbody></table>}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#edf0e7] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><p className="mr-auto self-center text-xs text-[#738273]">{preview.rows.length > 100 ? `Showing first 100 of ${preview.rows.length} records` : `${preview.rows.length} record${preview.rows.length === 1 ? "" : "s"}`}</p><button onClick={() => setPreview(null)} className="rounded-xl border border-[#dfe5d7] px-5 py-3 font-semibold text-[#354b38]">Cancel</button><button disabled={!preview.rows.length} onClick={downloadPreview} className="rounded-xl bg-[#28583b] px-5 py-3 font-semibold text-white disabled:opacity-50">Download CSV</button></div>
      </div>
    </div>}
  </div>;
}

const useToast = () => useContext(ToastContext);
