const Flock = require("../models/Flock");
const Production = require("../models/Production");
const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Mortality = require("../models/Mortality");

const range = (date) => { const start = new Date(date); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 1); return { $gte: start, $lt: end }; };
const total = async (Model, match, field) => (await Model.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: `$${field}` } } }]))[0]?.total || 0;
exports.getDashboard = async (req, res) => { try {
  const businessId = req.user.businessId; const now = new Date(); const today = range(now); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const month = { $gte: monthStart, $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  const [todayProduction, todaySales, todayExpenses, monthSales, monthExpenses, activeFlocks, customers, mortality, totalBirds, salesByCustomer, paidByCustomer] = await Promise.all([
    Production.aggregate([{ $match: { businessId, date: today } }, { $group: { _id: null, crates: { $sum: "$goodCrates" }, extraEggs: { $sum: "$extraEggs" }, brokenEggs: { $sum: "$brokenEggs" } } }]),
    total(Sale, { businessId, date: today }, "totalAmount"), total(Expense, { businessId, date: today }, "totalAmount"),
    total(Sale, { businessId, date: month }, "totalAmount"), total(Expense, { businessId, date: month }, "totalAmount"),
    Flock.countDocuments({ businessId, status: "active" }), Customer.countDocuments({ businessId }),
    Mortality.aggregate([{ $match: { businessId } }, { $group: { _id: "$flockId", quantity: { $sum: "$quantity" } } }]),
    Flock.aggregate([{ $match: { businessId, status: "active" } }, { $group: { _id: null, quantity: { $sum: "$initialQuantity" } } }]),
    Sale.aggregate([{ $match: { businessId } }, { $group: { _id: "$customerId", amount: { $sum: "$totalAmount" } } }]),
    Payment.aggregate([{ $match: { businessId } }, { $group: { _id: "$customerId", amount: { $sum: "$amount" } } }])
  ]);
  const deaths = mortality.reduce((sum, item) => sum + item.quantity, 0); const outstanding = salesByCustomer.reduce((sum, sale) => sum + Math.max(0, sale.amount - (paidByCustomer.find(p => String(p._id) === String(sale._id))?.amount || 0)), 0);
  res.json({ success: true, today: { production: todayProduction[0] || { crates: 0, extraEggs: 0, brokenEggs: 0 }, salesRevenue: todaySales, expenses: todayExpenses }, month: { salesRevenue: monthSales, expenses: monthExpenses, net: monthSales - monthExpenses }, farm: { activeFlocks, totalBirds: Math.max(0, (totalBirds[0]?.quantity || 0) - deaths) }, customers: { count: customers, outstandingCredit: outstanding } });
} catch (error) { console.error("Dashboard error:", error); res.status(500).json({ success: false, message: "Could not load dashboard." }); } };
