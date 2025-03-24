import { useState } from 'react';

const UserSearch = ({ onSearch }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for Ethereum address (0x + 40 hex chars)
    if (!address) {
      setError('Please enter an address');
      return;
    }
    
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address format');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // We could do additional validation here, like checking if the user exists
    // in the subgraph, but for simplicity we'll just pass it to the parent
    try {
      onSearch(address.toLowerCase());
    } catch (err) {
      setError('Error searching for user');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Search User</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Example Addresses:</h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setAddress('0x7e4A8391C728fEd9069B2962699AB416628B19Fa');
              onSearch('0x7e4a8391c728fed9069b2962699ab416628b19fa');
            }}
            className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            0x7e4A8391C728fEd9069B2962699AB416628B19Fa
          </button>
          <button
            type="button"
            onClick={() => {
              setAddress('0x58b8527743f9e8deEc3D3931321dF0513D5a032C');
              onSearch('0x58b8527743f9e8deec3d3931321df0513d5a032c');
            }}
            className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            0x58b8527743f9e8deEc3D3931321dF0513D5a032C
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;