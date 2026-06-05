const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
