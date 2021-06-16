const path = require("path");

// Use the existing dishes data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

function orderIsValid(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  if (!deliverTo || deliverTo === "") {
    next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  } else if (!mobileNumber || mobileNumber === "") {
    next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  } else if (!dishes) {
    next({
      status: 400,
      message: "Order must include a dish",
    });
  } else if (!Array.isArray(dishes) || dishes.length === 0) {
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
  } else {
    dishes.forEach((dish) => {
      if (
        !dish.quantity ||
        dish.quantity <= 0 ||
        typeof dish.quantity !== "number"
      ) {
        next({
          status: 400,
          message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
        });
      } else {
        next();
      }
    });
  }
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };

  res.json({ data: newOrder });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  res.status(404).json({ error: "not found!" });
}

function updateValidation(req, res, next) {
  const { data: { id, status } = {} } = req.body;
  const { orderId } = req.params;

  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  next();
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  res.locals.order.id = req.params.orderId;
  res.locals.order.deliverTo = deliverTo;
  res.locals.order.mobileNumber = mobileNumber;
  res.locals.order.status = status;
  res.locals.order.dishes = dishes;


  res.json({ data: res.locals.order });
}

module.exports = {
  list,
  create: [orderIsValid, create],
  read: [orderExists, read],
  update: [orderExists, orderIsValid, updateValidation, update],
};
