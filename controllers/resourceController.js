const Flock = require("../models/Flock");
const Mortality = require("../models/Mortality");
const Production = require("../models/Production");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");
const own = (req) => ({ businessId: req.user.businessId });
const replyError = (res, error) => res.status(error.name === "ValidationError" ? 400 : 500).json({ success: false, message: error.name === "ValidationError" ? error.message : "Server error." });
const dateFilter = (query) => { const f = {}; if (query.startDate || query.endDate) { f.date = {}; if (query.startDate) f.date.$gte = new Date(query.startDate); if (query.endDate) { const d = new Date(query.endDate); d.setHours(23, 59, 59, 999); f.date.$lte = d; } } return f; };
const ensureFlock = async (req, flockId) => !flockId || Flock.exists({ _id: flockId, ...own(req) });
const crud = (Model, { populate = "", beforeCreate, beforeUpdate, query = () => ({}) } = {}) => ({
  create: async (req, res) => { try { if (beforeCreate && !(await beforeCreate(req, res))) return; const item = await Model.create({ ...req.body, ...own(req) }); res.status(201).json({ success: true, item }); } catch (e) { replyError(res, e); } },
  list: async (req, res) => { try { const filter = { ...own(req), ...dateFilter(req.query), ...query(req.query) }; const items = await Model.find(filter).populate(populate).sort({ date: -1, createdAt: -1 }); res.json({ success: true, count: items.length, items }); } catch (e) { replyError(res, e); } },
  get: async (req, res) => { try { const item = await Model.findOne({ _id: req.params.id, ...own(req) }).populate(populate); if (!item) return res.status(404).json({ success: false, message: "Record not found." }); res.json({ success: true, item }); } catch (e) { replyError(res, e); } },
  update: async (req, res) => { try { if (beforeUpdate && !(await beforeUpdate(req, res))) return; const item = await Model.findOneAndUpdate({ _id: req.params.id, ...own(req) }, req.body, { new: true, runValidators: true }); if (!item) return res.status(404).json({ success: false, message: "Record not found." }); res.json({ success: true, item }); } catch (e) { replyError(res, e); } },
  remove: async (req, res) => { try { const item = await Model.findOneAndDelete({ _id: req.params.id, ...own(req) }); if (!item) return res.status(404).json({ success: false, message: "Record not found." }); res.json({ success: true, message: "Record deleted." }); } catch (e) { replyError(res, e); } }
});
const flockCheck = async (req, res) => { if (!(await ensureFlock(req, req.body.flockId))) { res.status(404).json({ success: false, message: "Flock not found." }); return false; } return true; };
exports.flocks = crud(Flock, { query: q => q.status ? { status: q.status } : {} });
exports.mortalities = crud(Mortality, { populate: "flockId", beforeCreate: flockCheck, beforeUpdate: flockCheck, query: q => q.flockId ? { flockId: q.flockId } : {} });
exports.production = crud(Production, { populate: "flockId", beforeCreate: flockCheck, beforeUpdate: flockCheck, query: q => q.flockId ? { flockId: q.flockId } : {} });
exports.customers = crud(Customer, { query: q => q.status ? { status: q.status } : {} });
exports.sales = crud(Sale, { populate: "customerId flockId", beforeCreate: flockCheck, beforeUpdate: flockCheck, query: q => ({ ...(q.customerId ? { customerId: q.customerId } : {}), ...(q.product ? { product: q.product } : {}) }) });
exports.payments = crud(Payment, { populate: "customerId saleId", query: q => q.customerId ? { customerId: q.customerId } : {} });
exports.expenses = crud(Expense, { populate: "flockId", beforeCreate: flockCheck, beforeUpdate: flockCheck, query: q => ({ ...(q.flockId ? { flockId: q.flockId } : {}), ...(q.category ? { category: q.category } : {}) }) });
exports.customerBalances = async (req, res) => { try { const customers = await Customer.find(own(req)); const balances = await Promise.all(customers.map(async (customer) => { const sales = await Sale.aggregate([{ $match: { businessId: req.user.businessId, customerId: customer._id } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]); const payments = await Payment.aggregate([{ $match: { businessId: req.user.businessId, customerId: customer._id } }, { $group: { _id: null, total: { $sum: "$amount" } } }]); const totalSales = sales[0]?.total || 0; const totalPaid = payments[0]?.total || 0; return { customer, totalSales, totalPaid, balance: totalSales - totalPaid }; })); res.json({ success: true, customers: balances, outstandingTotal: balances.reduce((sum, x) => sum + Math.max(x.balance, 0), 0) }); } catch (e) { replyError(res, e); } };
exports.expenseSummary = async (req, res) => { try { const filter = { ...own(req), ...dateFilter(req.query) }; const summary = await Expense.aggregate([{ $match: filter }, { $group: { _id: "$category", total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]); res.json({ success: true, total: summary.reduce((x, y) => x + y.total, 0), categories: summary }); } catch (e) { replyError(res, e); } };
