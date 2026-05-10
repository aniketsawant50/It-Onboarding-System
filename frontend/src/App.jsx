import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminCreateEmployee from './pages/Admin/AdminCreateEmployee';
import AdminAssignAssets from './pages/Admin/AdminAssignAssets';
import AdminEmployees from './pages/Admin/AdminEmployees';
import AdminRoles from './pages/Admin/AdminRoles';
import HRDashboard from './pages/HR/HRDashboard';
import HREmployeeQueue from './pages/HR/HREmployeeQueue';
import HRAssetApprovals from './pages/HR/HRAssetApprovals';
import HRManagerHandoff from './pages/HR/HRManagerHandoff';
import HROnboardingProgress from './pages/HR/HROnboardingProgress';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerTeamMembers from './pages/Manager/ManagerTeamMembers';
import ManagerAssignTask from './pages/Manager/ManagerAssignTask';
import ManagerTaskBoard from './pages/Manager/ManagerTaskBoard';
import ManagerTeamProgress from './pages/Manager/ManagerTeamProgress';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import EmployeeMyTasks from './pages/Employee/EmployeeMyTasks';
import EmployeeMyTraining from './pages/Employee/EmployeeMyTraining';
import EmployeeMyAssets from './pages/Employee/EmployeeMyAssets';
import EmployeeUpdateProfile from './pages/Employee/EmployeeUpdateProfile';
import ReportsPage from './pages/Reports/ReportsPage';
import adminLinks from './pages/Admin/adminLinks';
import hrLinks from './pages/HR/hrLinks';
import managerLinks from './pages/Manager/managerLinks';
import employeeLinks from './pages/Employee/employeeLinks';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-employee"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCreateEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assign-assets"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAssignAssets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminRoles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ReportsPage links={adminLinks} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employee-queue"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HREmployeeQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/assets"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRAssetApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/manager-handoff"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRManagerHandoff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/progress"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HROnboardingProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/reports"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <ReportsPage links={hrLinks} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/team-members"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerTeamMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/assign-task"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerAssignTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/task-board"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerTaskBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/team-progress"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerTeamProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ReportsPage links={managerLinks} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-tasks"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeMyTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-training"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeMyTraining />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-assets"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeMyAssets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/reports"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <ReportsPage links={employeeLinks} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-profile"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeUpdateProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
