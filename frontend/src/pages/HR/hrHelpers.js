export const EMPLOYEE_LIFECYCLE_STATUSES = [
  'PENDING_HR_APPROVAL',
  'HR_REVIEW',
  'QUERY_TO_ADMIN',
  'ACTIVE',
  'INACTIVE',
  'REJECTED'
];

export const HR_STAGE_OPTIONS = EMPLOYEE_LIFECYCLE_STATUSES;

export function formatStatus(status) {
  return (status || 'PENDING')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getStatusTone(status) {
  switch (status) {
    case 'COMPLETED':
    case 'HR_APPROVED':
    case 'ASSET_APPROVED':
    case 'APPROVED':
    case 'ACTIVE':
      return 'chipSuccess';
    case 'MANAGER_REVIEW':
    case 'ONBOARDING_IN_PROGRESS':
    case 'HR_REVIEW':
    case 'QUERY_TO_ADMIN':
      return 'chipInfo';
    case 'ASSIGNED':
    case 'PENDING':
    case 'PENDING_HR_APPROVAL':
    case 'PENDING_APPROVAL':
      return 'chipWarning';
    case 'REJECTED':
    case 'INACTIVE':
    case 'ASSET_REVIEW_REQUIRED':
      return 'chipDanger';
    default:
      return 'chipMuted';
  }
}

export function buildEmployeeSnapshots(users, assets, trainings, tasks) {
  return users
    .filter((user) => user.role === 'EMPLOYEE')
    .map((employee) => {
      const employeeAssets = assets.filter((asset) => asset.assignedTo?.id === employee.id);
      const employeeTrainings = trainings.filter((training) => training.employeeId === employee.id);
      const employeeTasks = tasks.filter((task) => task.assignedTo?.id === employee.id);
      const completedTasks = employeeTasks.filter(
        (task) => task.status?.toUpperCase() === 'COMPLETED'
      ).length;
      const latestAsset = employeeAssets[employeeAssets.length - 1];
      const latestTraining = employeeTrainings[employeeTrainings.length - 1];

      return {
        ...employee,
        assetCount: employeeAssets.length,
        assetStatus: latestAsset?.status || 'NOT_ASSIGNED',
        trainingCount: employeeTrainings.length,
        completedTrainingCount: employeeTrainings.filter((training) => training.completionStatus)
          .length,
        latestTrainingTitle: latestTraining?.title || 'Not assigned',
        taskCount: employeeTasks.length,
        completedTaskCount: completedTasks,
        completionRate: employeeTasks.length
          ? Math.round((completedTasks / employeeTasks.length) * 100)
          : 0
      };
    });
}
