class apiError {
  constructor(success = false, statusCode, data, message, error = true) {
    (this.success = success),
      (this.statusCode = statusCode),
      (this.data = data),
      (this.message = message),
      (this.error = error);
  }
}

module.exports = { apiError };
