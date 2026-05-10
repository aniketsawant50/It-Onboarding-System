-- Test Data for Asset Management System
-- This script adds sample data to test the asset assignment workflow

-- First, check if test employees already exist
SELECT 'Checking existing employees...' AS 'Status';

-- View current users
SELECT id, name, role, email FROM users WHERE role = 'EMPLOYEE' LIMIT 5;

-- To manually test:
-- 1. Create an EMPLOYEE user via Admin Create Employee page
-- 2. Note the employee ID
-- 3. Go to Admin > Assign Assets
-- 4. Fill in:
--    - Asset Name: "Dell XPS 13"
--    - Asset Type: "Laptop"
--    - Serial Number: "DELL-12345"
--    - Assign To: [Select the employee you created]
-- 5. Click "Assign Asset"
-- 6. Go to HR > Asset Approvals
-- 7. Click "Approve" for the asset
-- 8. Login as the employee
-- 9. Navigate to Employee Dashboard > My Assets
-- 10. You should see the approved asset listed

-- If you want to manually insert test data via SQL:
-- Uncomment the following section ONLY if you know the employee ID

/*
-- IMPORTANT: Replace 5 with the actual employee ID from your database
INSERT INTO assets (name, type, serial_number, status, assigned_to) 
VALUES 
  ('Dell XPS 13', 'Laptop', 'DELL-XPS-001', 'PENDING', 5),
  ('MacBook Pro', 'Laptop', 'MB-PRO-002', 'PENDING', 5),
  ('iPhone 15', 'Mobile', 'IPHONE-15-003', 'APPROVED', 5),
  ('Monitor Dell', 'Monitor', 'DELL-MON-004', 'PENDING', 5);

-- Record asset assignment history
INSERT INTO asset_assignment_history (asset_id, assigned_to_id, previous_status, new_status, assignment_date, assigned_by, notes)
SELECT id, assigned_to, 'NEW', 'PENDING', NOW(), 'ADMIN', 'Test asset created'
FROM assets 
WHERE assigned_to = 5 AND status = 'PENDING';
*/

-- Query to verify assets for a specific employee (replace 5 with actual employee ID)
-- SELECT * FROM assets WHERE assigned_to = 5;
