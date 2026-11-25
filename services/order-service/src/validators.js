function isValidCartItem(bookCode, title, qty) {
  return Boolean(bookCode) &&
    Boolean(title) &&
    Number.isInteger(qty) &&
    qty > 0;
}

function isValidUserId(userId) {
  return Number.isInteger(userId) && userId > 0;
}

module.exports = {
  isValidCartItem,
  isValidUserId
};
