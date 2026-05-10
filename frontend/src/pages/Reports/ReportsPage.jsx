import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/UI/Card/Card';
import Table from '../../components/UI/Table/Table';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import { reportsApi, userApi } from '../../services/api';
import styles from './ReportsPage.module.css';

const reportTypeByRole = {
  ADMIN: [
    { value: 'ALL_EMPLOYEES', label: 'All Employees Report' },
    { value: 'ONBOARDING_STATUS', label: 'Onboarding Status Report' },
    { value: 'TASK_COMPLETION', label: 'Task Completion Report' },
    { value: 'ASSET_ALLOCATION', label: 'Asset Allocation Report' }
  ],
  HR: [
    { value: 'EMPLOYEE_ONBOARDING', label: 'Employee Onboarding Report' },
    { value: 'NEW_JOINERS', label: 'New Joiners Report' },
    { value: 'PENDING_ONBOARDING', label: 'Pending Onboarding Report' },
    { value: 'TRAINING_PROGRESS', label: 'Training Progress Report' }
  ],
  MANAGER: [
    { value: 'TEAM_TASK', label: 'Team Task Report' },
    { value: 'TASK_COMPLETION', label: 'Task Completion Report' },
    { value: 'EMPLOYEE_PERFORMANCE', label: 'Employee Performance Report' }
  ],
  EMPLOYEE: [
    { value: 'PERSONAL_TASK', label: 'Personal Task Report' },
    { value: 'TRAINING_PROGRESS', label: 'Training Progress Report' }
  ]
};

const reportFilterConfig = {
  ALL_EMPLOYEES: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  ONBOARDING_STATUS: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  TASK_COMPLETION: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: true },
  ASSET_ALLOCATION: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  EMPLOYEE_ONBOARDING: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  NEW_JOINERS: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  PENDING_ONBOARDING: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  TRAINING_PROGRESS: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: false },
  TEAM_TASK: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: true },
  EMPLOYEE_PERFORMANCE: { employeeStatus: true, onboardingStatus: true, employeeId: true, taskStatus: true },
  PERSONAL_TASK: { employeeStatus: false, onboardingStatus: false, employeeId: false, taskStatus: true }
};

const initialFilterState = {
  reportType: '',
  startDate: '',
  endDate: '',
  employeeStatus: '',
  onboardingStatus: '',
  taskStatus: '',
  employeeId: ''
};

function roleTitle(role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

async function extractAxiosErrorMessage(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object' && !(data instanceof Blob)) {
    return data.message || data.error || error.message;
  }

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      try {
        const parsed = JSON.parse(text);
        return parsed.message || parsed.error || text;
      } catch {
        return text;
      }
    } catch {
      // ignore
    }
  }

  if (status === 401) return 'You are not authenticated. Please log in again.';
  if (status === 403) return 'You do not have permission to download this report.';
  return error?.message || 'Request failed.';
}

function ReportsPage({ links }) {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const reportTypes = reportTypeByRole[role] || [];
  const defaultReportType = reportTypes[0]?.value || '';

  const [filters, setFilters] = useState({ ...initialFilterState, reportType: defaultReportType });

  useEffect(() => {
    setFilters({ ...initialFilterState, reportType: reportTypeByRole[role]?.[0]?.value || '' });
  }, [role]);

  useEffect(() => {
    const loadUsers = async () => {
      if (role === 'EMPLOYEE') return;
      try {
        const { data } = await userApi.getAll();
        setUsers(data.filter((entry) => entry.role === 'EMPLOYEE'));
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, [role]);

  const activeFilterConfig = reportFilterConfig[filters.reportType] || {
    employeeStatus: true,
    onboardingStatus: true,
    employeeId: role !== 'EMPLOYEE',
    taskStatus: true
  };

  const hasDateRangeError =
    Boolean(filters.startDate) && Boolean(filters.endDate) && filters.endDate < filters.startDate;

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      employeeStatus: activeFilterConfig.employeeStatus ? filters.employeeStatus : '',
      onboardingStatus: activeFilterConfig.onboardingStatus ? filters.onboardingStatus : '',
      taskStatus: activeFilterConfig.taskStatus ? filters.taskStatus : '',
      employeeId: role !== 'EMPLOYEE' && activeFilterConfig.employeeId ? filters.employeeId : ''
    }),
    [activeFilterConfig.employeeId, activeFilterConfig.employeeStatus, activeFilterConfig.onboardingStatus, activeFilterConfig.taskStatus, filters, role]
  );

  const payload = useMemo(() => {
    const request = {
      reportType: effectiveFilters.reportType,
      startDate: effectiveFilters.startDate || null,
      endDate: effectiveFilters.endDate || null,
      employeeStatus: effectiveFilters.employeeStatus || null,
      onboardingStatus: effectiveFilters.onboardingStatus || null,
      taskStatus: effectiveFilters.taskStatus || null
    };

    if (role === 'EMPLOYEE') {
      request.employeeId = user?.id;
    } else if (effectiveFilters.employeeId) {
      request.employeeId = Number(effectiveFilters.employeeId);
    }

    return request;
  }, [effectiveFilters, role, user?.id]);

  const columns = useMemo(
    () =>
      (report?.columns || []).map((column) => ({
        key: column,
        header: column,
        render: (row) => row.data?.[column] || '-'
      })),
    [report]
  );

  const rows = report?.rows || [];

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = async () => {
    if (hasDateRangeError) {
      setError('End date cannot be before start date.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await reportsApi.generate(payload);
      setReport(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (hasDateRangeError) {
      setError('End date cannot be before start date.');
      return;
    }
    setError('');
    setDownloadLoading(true);
    try {
      const response = await reportsApi.download(payload);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${(filters.reportType || 'report').toLowerCase()}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (requestError) {
      setError((await extractAxiosErrorMessage(requestError)) || 'Unable to download PDF report.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const resetFilters = () => {
    setError('');
    setFilters({ ...initialFilterState, reportType: defaultReportType });
  };

  return (
    <MainLayout links={links} title={`${roleTitle(role)} Reports`}>
      <div className={styles.grid}>
        <Card title="Report Filters" subtitle="Apply filters and generate role-based reports.">
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.filters}>
            <label>
              Report Type
              <select name="reportType" value={filters.reportType} onChange={onFilterChange}>
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start Date
              <input name="startDate" type="date" value={filters.startDate} onChange={onFilterChange} />
            </label>
            <label>
              End Date
              <input name="endDate" type="date" value={filters.endDate} onChange={onFilterChange} />
            </label>
            {activeFilterConfig.employeeStatus ? (
              <label>
                Employee Status
                <select name="employeeStatus" value={filters.employeeStatus} onChange={onFilterChange}>
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            ) : null}
            {activeFilterConfig.onboardingStatus ? (
              <label>
                Onboarding Status
                <select name="onboardingStatus" value={filters.onboardingStatus} onChange={onFilterChange}>
                  <option value="">All</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </label>
            ) : null}
            {activeFilterConfig.taskStatus ? (
              <label>
                Task Status
                <select name="taskStatus" value={filters.taskStatus} onChange={onFilterChange}>
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
            ) : null}
            {role !== 'EMPLOYEE' && activeFilterConfig.employeeId ? (
              <label>
                Employee
                <select name="employeeId" value={filters.employeeId} onChange={onFilterChange}>
                  <option value="">All Employees</option>
                  {users.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.username})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          {hasDateRangeError ? <p className={styles.error}>End date cannot be before start date.</p> : null}
          <div className={styles.actions}>
            <button type="button" onClick={generateReport} disabled={loading || !filters.reportType || hasDateRangeError}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button type="button" onClick={downloadPdf} disabled={downloadLoading || !filters.reportType || hasDateRangeError}>
              {downloadLoading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetFilters}
              disabled={loading || downloadLoading}
            >
              Reset Filters
            </button>
          </div>
        </Card>

        <Card title="Report Output" subtitle="Generated report data in table format.">
          <Table
            columns={columns.length ? columns : [{ key: 'empty', header: 'Report Data', render: () => '-' }]}
            rows={columns.length ? rows : []}
            emptyMessage="Generate a report to see data."
          />
          {report ? (
            <p className={styles.meta}>
              {report.reportName} • {report.totalRecords} records
            </p>
          ) : null}
        </Card>
      </div>
    </MainLayout>
  );
}

export default ReportsPage;
