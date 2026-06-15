function calculateLineTotal(quantity, rate) {
  return Number(quantity) * Number(rate);
}

function calculateOrderTotal(items = []) {
  return items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.rate);
  }, 0);
}

module.exports = {
  calculateLineTotal,
  calculateOrderTotal,
};
