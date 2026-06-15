import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStoredUser } from '../api/authApi';
import { deleteCustomer, getCustomers } from '../api/customerApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingMessage from '../components/ui/LoadingMessage';

function CustomersPage() {
  const user = getStoredUser();
  const isAdmin = user?.role === 'ADMIN';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadCustomers() {
    try {
      setLoading(true);
      setLoadError('');
      const data = await getCustomers();
      setCustomers(data ?? []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Deactivate this customer? It will be hidden from active customer lists.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError('');
      await deleteCustomer(id);
      await loadCustomers();
    } catch (err) {
      setActionError(err.message || 'Failed to deactivate customer');
    }
  }

  if (loading) {
    return <LoadingMessage message="Loading customers..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">
            Manage customer master data used in sales orders.
          </p>
        </div>

        {isAdmin ? (
          <Link to="/customers/new">
            <Button>Add Customer</Button>
          </Link>
        ) : null}
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Create your first customer to start using sales orders."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  {isAdmin ? (
                    <th className="px-3 py-2 font-medium">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {customer.code}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.email || '-'}
                    </td>
                    {isAdmin ? (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/customers/${customer.id}/edit`}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(customer.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CustomersPage;
