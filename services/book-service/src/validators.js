function isValidBookId(id) {
  return /^[1-9][0-9]*$/.test(id);
}

module.exports = {
  isValidBookId
};
