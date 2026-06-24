const path = require('path');
const fs = require('fs');

let products = [];
let orders = [];

function loadData() {
  try {
    const productsPath = path.join(__dirname, 'products.json');
    if (fs.existsSync(productsPath)) {
      products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Error loading products", e);
  }

  try {
    const ordersPath = path.join(__dirname, 'orders.json');
    if (fs.existsSync(ordersPath)) {
      orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Error loading orders", e);
  }
}

function initDb() {
  loadData();
  return Promise.resolve();
}

// Product Queries
function getProducts(page = 1, limit = 20, category = null) {
  return new Promise((resolve) => {
    let filtered = products;
    if (category && category !== 'All Products') {
      if (category === 'Flats & Juttis') {
        filtered = filtered.filter(p => p.category === 'Flats' || p.category === 'Juttis');
      } else {
        filtered = filtered.filter(p => p.category === category);
      }
    }
    const start = (page - 1) * limit;
    resolve(filtered.slice(start, start + limit));
  });
}

function getTotalProductsCount(category = null) {
  return new Promise((resolve) => {
    let filtered = products;
    if (category && category !== 'All Products') {
      if (category === 'Flats & Juttis') {
        filtered = filtered.filter(p => p.category === 'Flats' || p.category === 'Juttis');
      } else {
        filtered = filtered.filter(p => p.category === category);
      }
    }
    resolve(filtered.length);
  });
}

function getProductById(id) {
  return new Promise((resolve) => {
    resolve(products.find(p => p.id === parseInt(id, 10)));
  });
}

function addProduct(p) {
  return new Promise((resolve) => {
    const newId = products.length > 0 ? Math.max(...products.map(pr => pr.id)) + 1 : 1;
    const newProduct = { id: newId, ...p };
    products.push(newProduct);
    resolve(newProduct);
  });
}

function updateProduct(id, p) {
  return new Promise((resolve) => {
    const index = products.findIndex(pr => pr.id === parseInt(id, 10));
    if (index !== -1) {
      products[index] = { ...products[index], ...p, id: parseInt(id, 10) };
      resolve({ updated: 1 });
    } else {
      resolve({ updated: 0 });
    }
  });
}

function deleteProduct(id) {
  return new Promise((resolve) => {
    const initialLength = products.length;
    products = products.filter(pr => pr.id !== parseInt(id, 10));
    resolve({ deleted: initialLength !== products.length ? 1 : 0 });
  });
}

// Order Queries
function getOrders() {
  return new Promise((resolve) => {
    resolve([...orders].reverse());
  });
}

function addOrder(o) {
  return new Promise((resolve) => {
    const nextId = orders.length > 0 ? Math.max(...orders.map(or => or.id)) + 1 : 1044;
    const nextOrderNumber = `L72-${nextId}`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newOrder = {
      id: nextId,
      orderNumber: nextOrderNumber,
      date,
      status: 'Pending',
      customer: o.customer || {},
      items: o.items || [],
      total: o.total || 0
    };
    orders.push(newOrder);
    resolve(newOrder);
  });
}

function updateOrderStatus(id, status) {
  return new Promise((resolve) => {
    const index = orders.findIndex(or => or.id === parseInt(id, 10));
    if (index !== -1) {
      orders[index].status = status;
      resolve({ updated: 1 });
    } else {
      resolve({ updated: 0 });
    }
  });
}

module.exports = {
  initDb,
  getProducts,
  getTotalProductsCount,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  addOrder,
  updateOrderStatus
};
