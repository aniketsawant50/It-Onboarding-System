package com.onboarding.system.onboarding;

/**
 * Employee onboarding lifecycle stored in {@code users.status} for {@code Role.EMPLOYEE}.
 *
 * <p>Flow (see {@link com.onboarding.system.service.HrOnboardingService}):</p>
 * <ul>
 *   <li>{@link #PENDING_HR_APPROVAL} – Admin-created employee; HR has not started review.</li>
 *   <li>{@link #HR_REVIEW} – Entered when HR chooses <strong>Approve</strong> on the pending list
 *       (HR verification in progress; assign reporting manager here before activation).</li>
 *   <li>{@link #ACTIVE} – Set only by HR <strong>Activate</strong> after verification and manager assigned.</li>
 *   <li>{@link #QUERY_TO_ADMIN} – HR sent a query back to Admin.</li>
 *   <li>{@link #REJECTED} – HR rejected the pending/review record.</li>
 *   <li>{@link #INACTIVE} – Deactivated account (administrative).</li>
 * </ul>
 */
public enum EmployeeLifecycleStatus {
    PENDING_HR_APPROVAL,
    HR_REVIEW,
    QUERY_TO_ADMIN,
    REJECTED,
    ACTIVE,
    INACTIVE;

    public static boolean isLoginAllowed(String status) {
        return ACTIVE.name().equalsIgnoreCase(status);
    }

    public static boolean isDeactivated(String status) {
        return INACTIVE.name().equalsIgnoreCase(status);
    }
}
