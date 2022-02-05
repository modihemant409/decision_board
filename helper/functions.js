exports.dataNotFound = (model, message, statuscode) => {
  if (!model) {
    const error = new Error(message);
    error.statuscode = statuscode;
    throw error;
  }
};
