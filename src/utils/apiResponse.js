class apiResponse {
  constructor(success = true, data, message, error = false) {
    (this.success = success),
      (this.data = data),
      (this.message = message),
      (this.error = error);
  }
}

module.exports = { apiResponse };
