module.exports = {
  santizeQuery: (req) => {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const santizedFields = Object.keys(req.query).filter(
      (el) => !excludedFields.includes(el)
    );
    const queryObject = santizedFields.reduce((acc, curr) => {
      acc[curr] = req.query[curr];
      return acc;
    }, {});

    const regex = /\b(gte|gt|lte|lt|ne)\b/g;
    const queryString = JSON.stringify(queryObject);
    return JSON.parse(queryString.replace(regex, (match) => `$${match}`));
  },
};
