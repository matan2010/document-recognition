import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiService from '../api.service';

// FR 7 - Frontend API Integration
// NFR 4.1.1 - Performance Requirements
describe('ApiService', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(apiService.api);
    localStorage.clear();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  // FR 1.2 - User Authentication
  // NFR 4.1.1 - Security Requirements
  describe('Authentication Header', () => {
    it('should add authorization header when token exists', async () => {
      const token = 'test-token';
      localStorage.setItem('access_token', token);
      
      mockAxios.onGet('/clients').reply(config => {
        expect(config.headers.Authorization).toBe(`Bearer ${token}`);
        return [200, []];
      });

      await apiService.getClientsWithDocuments();
    });

    it('should not add authorization header when token does not exist', async () => {
      mockAxios.onGet('/clients').reply(config => {
        expect(config.headers.Authorization).toBeUndefined();
        return [200, []];
      });

      await apiService.getClientsWithDocuments();
    });
  });

  // FR 2.2 - Client Data Management
  // FR 2.3 - Client Document Association
  // NFR 4.1.1 - Performance Requirements
  describe('getClientsWithDocuments', () => {
    it('should fetch clients successfully', async () => {
      const mockData = [{ id: 1, name: 'Client 1' }];
      mockAxios.onGet('/clients').reply(200, mockData);

      const result = await apiService.getClientsWithDocuments();
      expect(result).toEqual(mockData);
    });

    it('should handle error when fetching clients fails', async () => {
      mockAxios.onGet('/clients').reply(500);

      await expect(apiService.getClientsWithDocuments()).rejects.toThrow();
    });
  });

  // FR 2.2 - Client Data Management
  // FR 2.3 - Client Document Association
  // NFR 4.1.1 - Performance Requirements
  describe('getClientWithDocuments', () => {
    it('should fetch specific client successfully', async () => {
      const clientId = 1;
      const mockData = { id: clientId, name: 'Client 1' };
      mockAxios.onGet(`/clients/${clientId}`).reply(200, mockData);

      const result = await apiService.getClientWithDocuments(clientId);
      expect(result).toEqual(mockData);
    });

    it('should handle error when fetching specific client fails', async () => {
      const clientId = 1;
      mockAxios.onGet(`/clients/${clientId}`).reply(500);

      await expect(apiService.getClientWithDocuments(clientId)).rejects.toThrow();
    });
  });

  // FR 2.5 - Client Analytics Dashboard
  // NFR 4.1.1 - Performance Requirements
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('getClientDashboard', () => {
    it('should fetch client dashboard data successfully', async () => {
      const clientId = 1;
      const mockData = { metrics: { total: 100 } };
      mockAxios.onGet(`/dashboard/client/${clientId}`).reply(200, mockData);

      const result = await apiService.getClientDashboard(clientId);
      expect(result).toEqual(mockData);
    });

    it('should handle error when fetching client dashboard fails', async () => {
      const clientId = 1;
      mockAxios.onGet(`/dashboard/client/${clientId}`).reply(500);

      await expect(apiService.getClientDashboard(clientId)).rejects.toThrow();
    });
  });

  // FR 5.5 - Company Analytics Dashboard
  // NFR 4.1.1 - Performance Requirements
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('getCompanyDashboard', () => {
    it('should fetch company dashboard data successfully', async () => {
      const mockData = { metrics: { total: 1000 } };
      mockAxios.onGet('/dashboard/company').reply(200, mockData);

      const result = await apiService.getCompanyDashboard();
      expect(result).toEqual(mockData);
    });

    it('should handle error when fetching company dashboard fails', async () => {
      mockAxios.onGet('/dashboard/company').reply(500);

      await expect(apiService.getCompanyDashboard()).rejects.toThrow();
    });
  });
}); 