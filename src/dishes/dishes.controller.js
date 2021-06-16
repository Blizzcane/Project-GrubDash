const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function bodyIsValid(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name || name === "") {
    next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  if (!description || description === "") {
    next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }
  if (price <= 0 || typeof price !== "number") {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!image_url || image_url === "") {
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }

  next();
}

//GET /dishes
function list(req, res) {
  res.json({ data: dishes });
}

//GET /dishes/:dishId
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
    return;
  }

  res.status(404).json({ error: "not found!" });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

//POST /dishes
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function idCheck(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { dishId } = req.params;

  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

function update(req, res) {
  const { data: { id, name, description, image_url, price } = {} } = req.body;

  res.locals.dish.id = id;
  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.image_url = image_url;
  res.locals.dish.price = price;

  res.json({ data: res.locals.dish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [bodyIsValid, create],
  update: [dishExists, idCheck, bodyIsValid, update],
};
