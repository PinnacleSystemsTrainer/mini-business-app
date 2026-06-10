import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';

vi.mock('../api/productApi', () => ({
  getProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      sku: 'P001',
      name: 'Notebook',
      price: 50,
      stockQty: 10,
    },
    {
      id: 2,
      sku: 'P002',
      name: 'Pen',
      price: 10,
      stockQty: 20,
    },
    {
      id: 3,
      sku: 'P003',
      name: 'Marker',
      price: 15,
      stockQty: 5,
    },
  ]),
  deleteProduct: vi.fn(),
}));

function renderProductsPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>
  );
}

describe('ProductsPage', () => {
  it('shows the products page heading and helper text', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('heading', { name: 'Products' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Product data loaded from the backend API.')
    ).toBeInTheDocument();
  });

  it('shows the Add Product link', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('link', { name: 'Add Product' })
    ).toBeInTheDocument();
  });

  it('shows product table headers after products are loaded', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('columnheader', { name: 'SKU' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Price' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Stock' })
    ).toBeInTheDocument();
  });

  it('renders products returned by the API', async () => {
    renderProductsPage();

    expect(await screen.findByText('P001')).toBeInTheDocument();
    expect(screen.getByText('Notebook')).toBeInTheDocument();

    expect(screen.getByText('P002')).toBeInTheDocument();
    expect(screen.getByText('Pen')).toBeInTheDocument();

    expect(screen.getByText('P003')).toBeInTheDocument();
    expect(screen.getByText('Marker')).toBeInTheDocument();
  });
});
