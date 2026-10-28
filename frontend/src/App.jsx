import { useState } from "react";
import FarmApp from "./FarmApp.jsx";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Flocks", icon: "🐔" },
  { name: "Egg Production", icon: "🥚" },
  { name: "Sales", icon: "↗" },
  { name: "Customers", icon: "♙" },
  { name: "Expenses", icon: "₦" },
];

const stats = [
  {
    label: "Today's Egg Production",
    value: "—",
    detail: "Crates collected today",
    icon: "🥚",
    color: "bg-lime-100",
  },
  {
    label: "Active Flocks",
    value: "—",
    detail: "Currently active batches",
    icon: "🐔",
    color: "bg-emerald-100",
  },
  {
    label: "Today's Revenue",
    value: "₦—",
    detail: "Sales recorded today",
    icon: "₦",
    color: "bg-amber-100",
  },
  {
    label: "Today's Expenses",
    value: "₦—",
    detail: "Expenses recorded today",
    icon: "↘",
    color: "bg-orange-100",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-[#f7f8f2] md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col bg-[#183d2b] text-white md:fixed md:inset-y-0 md:w-64">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6edb5] text-2xl">
            🌱
          </div>

          <div>
            <h1 className="font-bold tracking-wide">
              Divine Mercy
            </h1>
            <p className="text-xs text-green-200">FARMS MANAGEMENT</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-green-300">
            Farm workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  activePage === item.name
                    ? "bg-[#d6edb5] font-semibold text-[#183d2b]"
                    : "text-green-50 hover:bg-white/10"
                }`}
              >
                <span className="flex w-6 justify-center text-lg">
                  {item.icon}
                </span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto hidden p-4 md:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Growing together 🌿</p>
            <p className="mt-2 text-xs leading-5 text-green-200">
              Keeping your farm organized, one day at a time.
            </p>
          </div>
          <p className="mt-5 text-center text-xs text-green-300/70">
            Divine Mercy Farms © 2026
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:ml-64 md:p-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#738273]">
              Farm workspace / {activePage}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#183d2b] sm:text-3xl">
              {activePage === "Dashboard"
                ? "Good morning 👋"
                : activePage}
            </h2>
            <p className="mt-2 text-sm text-[#738273]">
              Here's what's happening at your farm today.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9dc] bg-white px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5efd9] text-xl">
              🌾
            </div>
            <div>
              <p className="text-sm font-semibold text-[#243629]">
                Farm Admin
              </p>
              <p className="text-xs text-[#738273]">
                Divine Mercy Farms
              </p>
            </div>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <>
            {/* Welcome banner */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#28583b] p-6 text-white sm:p-8">
              <div className="relative z-10 max-w-xl">
                <p className="text-sm font-medium text-[#d6edb5]">
                  YOUR FARM AT A GLANCE
                </p>
                <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Better records.
                  <br />
                  Healthier growth.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-green-100">
                  Track your flocks, daily egg collection, sales, and
                  expenses from one simple workspace.
                </p>

                <button
                  onClick={() => setActivePage("Egg Production")}
                  className="mt-6 rounded-xl bg-[#d6edb5] px-5 py-3 text-sm font-semibold text-[#183d2b] transition hover:bg-white"
                >
                  Record egg production →
                </button>
              </div>

              <div className="pointer-events-none absolute -right-4 -top-10 text-[150px] opacity-15 sm:right-8 sm:text-[190px]">
                🌿
              </div>
            </section>

            {/* Summary cards */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#243629]">
                  Farm overview
                </h3>
                <span className="text-xs text-[#738273]">
                  Today's summary
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#e8ebdf] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="max-w-[150px] text-sm leading-5 text-[#738273]">
                        {stat.label}
                      </p>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}
                      >
                        {stat.icon}
                      </div>
                    </div>

                    <p className="mt-5 text-3xl font-bold text-[#183d2b]">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-[#89958a]">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Lower dashboard */}
            <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#e8ebdf] bg-white p-6 lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#243629]">
                      Production activity
                    </h3>
                    <p className="mt-1 text-sm text-[#738273]">
                      Your egg collection records
                    </p>
                  </div>
                  <span className="rounded-lg bg-[#edf4e6] px-3 py-2 text-xs font-medium text-[#28583b]">
                    This week
                  </span>
                </div>

                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4e6] text-2xl">
                    🌱
                  </div>
                  <p className="mt-4 font-semibold text-[#354b38]">
                    Your farm's story starts here
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#89958a]">
                    Once you record daily egg production, your activity
                    and trends can appear here.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8ebdf] bg-white p-6">
                <h3 className="font-bold text-[#243629]">
                  Quick actions
                </h3>
                <p className="mt-1 text-sm text-[#738273]">
                  Common farm activities
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    ["🐔", "Add a flock", "Flocks"],
                    ["🥚", "Record egg collection", "Egg Production"],
                    ["🧾", "Record a sale", "Sales"],
                    ["💰", "Add an expense", "Expenses"],
                  ].map(([icon, label, page]) => (
                    <button
                      key={label}
                      onClick={() => setActivePage(page)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[#edf0e7] p-3 text-left transition hover:border-[#b7cf9c] hover:bg-[#f6f9f1]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e6] text-lg">
                        {icon}
                      </span>
                      <span className="flex-1 text-sm font-medium text-[#354b38]">
                        {label}
                      </span>
                      <span className="text-[#738273]">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-[#e8ebdf] bg-white p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4e6] text-2xl">
              {navigation.find((item) => item.name === activePage)?.icon}
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#183d2b]">
              {activePage}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#738273]">
              This section is ready for us to build next. We'll connect
              it to your existing farm API and add the forms and records
              needed for everyday use.
            </p>
            <button
              onClick={() => setActivePage("Dashboard")}
              className="mt-5 rounded-xl bg-[#28583b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183d2b]"
            >
              Back to dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default FarmApp;