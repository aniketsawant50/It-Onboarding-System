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
    case 'ACTIVE':
    case 'HR_APPROVED':
    case 'ASSET_APPROVED':
      return 'chipSuccess';
    case 'IN_PROGRESS':
    case 'ONBOARDING_IN_PROGRESS':
    case 'ASSIGNED':
    case 'HR_REVIEW':
    case 'QUERY_TO_ADMIN':
      return 'chipInfo';
    case 'PENDING':
    case 'PENDING_HR_APPROVAL':
    case 'PENDING_APPROVAL':
      return 'chipWarning';
    case 'REJECTED':
    case 'INACTIVE':
    case 'NOT_ASSIGNED':
      return 'chipDanger';
    default:
      return 'chipMuted';
  }
}

export function getCurrentUserFromStorage() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function buildEmployeeData(currentUser, assets, trainings, tasks) {
  if (!currentUser) return null;

  const employeeAssets = assets.filter((asset) => asset.assignedTo?.id === currentUser.id);
  const employeeTrainings = trainings.filter((training) => training.employeeId === currentUser.id);
  const employeeTasks = tasks.filter((task) => task.assignedTo?.id === currentUser.id);
  
  const completedTasks = employeeTasks.filter(
    (task) => task.status?.toUpperCase() === 'COMPLETED'
  ).length;
  
  const completedTrainings = employeeTrainings.filter(
    (training) => training.completionStatus
  ).length;

  const latestAsset = employeeAssets[employeeAssets.length - 1];
  const latestTraining = employeeTrainings[employeeTrainings.length - 1];

  return {
    ...currentUser,
    assetCount: employeeAssets.length,
    assets: employeeAssets,
    assetStatus: latestAsset?.status || 'NOT_ASSIGNED',
    trainingCount: employeeTrainings.length,
    trainings: employeeTrainings,
    completedTrainingCount: completedTrainings,
    latestTrainingTitle: latestTraining?.title || 'Not assigned',
    taskCount: employeeTasks.length,
    tasks: employeeTasks,
    completedTaskCount: completedTasks,
    activeTasks: employeeTasks.filter((task) => task.status?.toUpperCase() !== 'COMPLETED').length,
    completionRate: employeeTasks.length
      ? Math.round((completedTasks / employeeTasks.length) * 100)
      : 0
  };
}
