const Flock = require("../models/Flock");
const Production = require("../models/Production");
const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Mortality = require("../models/Mortality");

// Get the start and end of a particular day
const range = (date) => {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    $gte: start,
    $lt: end,
  };
};

// Calculate the total of a specific field
const total = async (Model, match, field) => {
  const result = await Model.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: `$${field}`,
        },
      },
    },
  ]);

  return result[0]?.total || 0;
};

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const now = new Date();

    // -----------------------------
    // DATE RANGES
    // -----------------------------

    const today = range(now);

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const month = {
      $gte: monthStart,
      $lt: nextMonthStart,
    };

    // -----------------------------
    // FETCH DASHBOARD DATA
    // -----------------------------

    const [
      todayProduction,
      todaySales,
      todayExpenses,
      monthSales,
      monthExpenses,
      activeFlocks,
      customers,
      activeFlockBirds,
      activeFlockMortality,
      activeFlockBirdSales,
      salesByCustomer,
      paidByCustomer,
    ] = await Promise.all([
      // --------------------------------
      // TODAY'S EGG PRODUCTION
      // --------------------------------

      Production.aggregate([
        {
          $match: {
            businessId,
            date: today,
          },
        },
        {
          $group: {
            _id: null,
            crates: {
              $sum: "$goodCrates",
            },
            extraEggs: {
              $sum: "$extraEggs",
            },
            brokenEggs: {
              $sum: "$brokenEggs",
            },
          },
        },
      ]),

      // --------------------------------
      // TODAY'S SALES
      // --------------------------------

      total(
        Sale,
        {
          businessId,
          date: today,
        },
        "totalAmount"
      ),

      // --------------------------------
      // TODAY'S EXPENSES
      // --------------------------------

      total(
        Expense,
        {
          businessId,
          date: today,
        },
        "totalAmount"
      ),

      // --------------------------------
      // THIS MONTH'S SALES
      // --------------------------------

      total(
        Sale,
        {
          businessId,
          date: month,
        },
        "totalAmount"
      ),

      // --------------------------------
      // THIS MONTH'S EXPENSES
      // --------------------------------

      total(
        Expense,
        {
          businessId,
          date: month,
        },
        "totalAmount"
      ),

      // --------------------------------
      // ACTIVE FLOCK COUNT
      // --------------------------------

      Flock.countDocuments({
        businessId,
        status: "active",
      }),

      // --------------------------------
      // CUSTOMER COUNT
      // --------------------------------

      Customer.countDocuments({
        businessId,
      }),

      // --------------------------------
      // INITIAL BIRDS IN ACTIVE FLOCKS
      // --------------------------------

      Flock.aggregate([
        {
          $match: {
            businessId,
            status: "active",
          },
        },
        {
          $group: {
            _id: null,
            quantity: {
              $sum: "$initialQuantity",
            },
          },
        },
      ]),

      // --------------------------------
      // MORTALITY IN ACTIVE FLOCKS
      // --------------------------------

      Mortality.aggregate([
        {
          $lookup: {
            from: "flocks",
            localField: "flockId",
            foreignField: "_id",
            as: "flock",
          },
        },
        {
          $unwind: "$flock",
        },
        {
          $match: {
            businessId,
            "flock.businessId": businessId,
            "flock.status": "active",
          },
        },
        {
          $group: {
            _id: null,
            quantity: {
              $sum: "$quantity",
            },
          },
        },
      ]),

      // --------------------------------
      // BIRDS SOLD FROM ACTIVE FLOCKS
      // --------------------------------

      Sale.aggregate([
        {
          $match: {
            businessId,
            product: "birds",
            flockId: {
              $ne: null,
            },
          },
        },
        {
          $lookup: {
            from: "flocks",
            localField: "flockId",
            foreignField: "_id",
            as: "flock",
          },
        },
        {
          $unwind: "$flock",
        },
        {
          $match: {
            "flock.businessId": businessId,
            "flock.status": "active",
          },
        },
        {
          $group: {
            _id: null,
            quantity: {
              $sum: "$quantity",
            },
          },
        },
      ]),

      // --------------------------------
      // TOTAL SALES PER CUSTOMER
      // --------------------------------

      Sale.aggregate([
        {
          $match: {
            businessId,
            customerId: {
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: "$customerId",
            amount: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      // --------------------------------
      // TOTAL PAYMENTS PER CUSTOMER
      // --------------------------------

      Payment.aggregate([
        {
          $match: {
            businessId,
            customerId: {
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: "$customerId",
            amount: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    // -----------------------------
    // CURRENT BIRD COUNT
    // -----------------------------

    const initialBirds =
      activeFlockBirds[0]?.quantity || 0;

    const deaths =
      activeFlockMortality[0]?.quantity || 0;

    const birdsSold =
      activeFlockBirdSales[0]?.quantity || 0;

    const currentBirds = Math.max(
      0,
      initialBirds - deaths - birdsSold
    );

    // -----------------------------
    // CUSTOMER CREDIT
    // -----------------------------

    const paymentMap = new Map();

    paidByCustomer.forEach((payment) => {
      paymentMap.set(
        String(payment._id),
        payment.amount
      );
    });

    const outstandingCredit =
      salesByCustomer.reduce((sum, sale) => {
        const paid =
          paymentMap.get(String(sale._id)) || 0;

        const balance =
          sale.amount - paid;

        return sum + Math.max(0, balance);
      }, 0);

    // -----------------------------
    // DASHBOARD RESPONSE
    // -----------------------------

    res.json({
      success: true,

      today: {
        production:
          todayProduction[0] || {
            crates: 0,
            extraEggs: 0,
            brokenEggs: 0,
          },

        salesRevenue: todaySales,

        expenses: todayExpenses,
      },

      month: {
        salesRevenue: monthSales,

        expenses: monthExpenses,

        net: monthSales - monthExpenses,
      },

      farm: {
        activeFlocks,

        totalBirds: currentBirds,
      },

      customers: {
        count: customers,

        outstandingCredit,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not load dashboard.",
    });
  }
};