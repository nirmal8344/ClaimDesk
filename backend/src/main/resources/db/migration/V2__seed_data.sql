-- Flyway Seed Data Migration V2: Realistic Seed Data matching UI References

-- 1. Users
INSERT INTO users (id, email, password, full_name, role, phone_number, department, employee_id, address, status, created_at)
VALUES 
-- Admin (password: Admin@123)
(1, 'admin@company.com', '$2b$10$I5OG2hgF4KGEvlMCZFo7G.DAHhc5e9VlvidOzcHrsusB9kL5wvC4S', 'Admin Kumar', 'ADMIN', '+91 98765 43210', 'Claims Management', 'ADM-001', 'HQ Office, Chennai', 'ACTIVE', '2024-01-01 09:00:00'),

-- Officers (password: Officer@123)
(2, 'rajesh.k@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Rajesh Kumar', 'CLAIM_OFFICER', '+91 98765 43210', 'Claims Processing', 'OFF-001', 'Regional Branch, Chennai', 'ACTIVE', '2024-01-15 09:00:00'),
(3, 'officer@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Officer Rajesh', 'CLAIM_OFFICER', '+91 98765 43210', 'Claims Processing', 'OFF-002', 'Regional Branch, Chennai', 'ACTIVE', '2024-01-15 09:00:00'),
(4, 'sanjay@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Sanjay P', 'CLAIM_OFFICER', '+91 91234 56780', 'Motor Claims', 'OFF-003', 'Branch Office, Bengaluru', 'ACTIVE', '2024-02-01 09:00:00'),
(5, 'lavanya@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Lavanya T', 'CLAIM_OFFICER', '+91 99887 76655', 'Health Claims', 'OFF-004', 'Branch Office, Hyderabad', 'ACTIVE', '2024-02-10 09:00:00'),
(6, 'manoj@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Manoj S', 'CLAIM_OFFICER', '+91 90011 22334', 'Property Claims', 'OFF-005', 'Branch Office, Mumbai', 'ACTIVE', '2024-02-15 09:00:00'),
(7, 'kavitha@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Kavitha R', 'CLAIM_OFFICER', '+91 93456 78901', 'Travel Claims', 'OFF-006', 'Branch Office, Delhi', 'INACTIVE', '2024-03-01 09:00:00'),
(8, 'dinesh@company.com', '$2b$10$VDPbYyUYSiisHL480ysm6.RlWKJVJP3FuFswKXGzqQ5Nh.Uyrx3pG', 'Dinesh N', 'CLAIM_OFFICER', '+91 97054 32109', 'General Claims', 'OFF-007', 'Branch Office, Kolkata', 'ACTIVE', '2024-03-05 09:00:00'),

-- Customers (password: Customer@123)
(9, 'arun.kumar@example.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Arun Kumar', 'CUSTOMER', '+91 98765 43210', NULL, NULL, 'No 12, Anna Nagar, Chennai - 600040', 'ACTIVE', '2024-03-10 10:00:00'),
(10, 'priya@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Priya S', 'CUSTOMER', '+91 91234 56780', NULL, NULL, '45 Green Park, Chennai', 'ACTIVE', '2024-03-15 11:00:00'),
(11, 'karthik@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Karthik R', 'CUSTOMER', '+91 99887 76655', NULL, NULL, '78 Gandhi Road, Madurai', 'ACTIVE', '2024-03-20 12:00:00'),
(12, 'divya@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Divya M', 'CUSTOMER', '+91 98761 23450', NULL, NULL, '102 Lake View, Coimbatore', 'ACTIVE', '2024-04-01 10:00:00'),
(13, 'suresh@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Suresh B', 'CUSTOMER', '+91 90011 22334', NULL, NULL, '12 Rajaji St, Salem', 'INACTIVE', '2024-04-10 14:00:00'),
(14, 'anitha@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Anitha V', 'CUSTOMER', '+91 93456 78901', NULL, NULL, '54 North Cross, Tiruchirappalli', 'ACTIVE', '2024-04-15 15:00:00'),
(15, 'ganesh@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Ganesh P', 'CUSTOMER', '+91 97054 32109', NULL, NULL, '89 Beach Road, Puducherry', 'ACTIVE', '2024-04-20 16:00:00'),
(16, 'meena@gmail.com', '$2b$10$em5cpTQt/otxWqBijFBqqOP0QdOBmf0PRmFN7ev/WLVbOlpaSWfw6', 'Meena K', 'CUSTOMER', '+91 90876 54321', NULL, NULL, '23 Temple Street, Tirunelveli', 'INACTIVE', '2024-05-01 09:00:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Claim Categories
INSERT INTO claim_categories (id, name, description, status)
VALUES
(1, 'Vehicle Damage', 'Accidents and vehicle related damage claims', 'ACTIVE'),
(2, 'Property Damage', 'Home, building and property damage related claims', 'ACTIVE'),
(3, 'Travel', 'Travel delay, medical emergency and luggage loss claims', 'ACTIVE'),
(4, 'Electronics/Device', 'Gadget and electronic device breakdown/damage claims', 'ACTIVE'),
(5, 'Other', 'Other miscellaneous insurance claims', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('claim_categories_id_seq', (SELECT MAX(id) FROM claim_categories));

-- 3. Policies
INSERT INTO policies (id, customer_id, policy_number, policy_type, provider_company, start_date, end_date, coverage_amount, premium_amount, premium_term, coverage_description, status)
VALUES
(1, 9, 'MI-2024-001', 'Motor Insurance', 'Aegis Insurance', '2024-12-12', '2025-12-12', 500000.00, 8500.00, 'year', 'Comprehensive private vehicle bumper to bumper cover including 3rd party liability and zero depreciation', 'ACTIVE'),
(2, 9, 'HI-2024-002', 'Health Insurance', 'Star Health', '2024-11-30', '2025-11-30', 300000.00, 12000.00, 'year', 'Family floater healthcare plan with cashless hospitalization at network hospitals across India', 'ACTIVE'),
(3, 9, 'HO-2023-005', 'Home Insurance', 'SecureLife', '2023-01-15', '2024-01-15', 1000000.00, 9000.00, 'year', 'Residential structure and household contents fire and flood protection policy', 'EXPIRED'),
(4, 10, 'HI-2024-003', 'Health Insurance', 'Star Health', '2024-05-01', '2025-05-01', 500000.00, 15000.00, 'year', 'Individual health coverage with critical illness rider', 'ACTIVE'),
(5, 11, 'HO-2023-006', 'Home Insurance', 'HDFC ERGO', '2024-01-15', '2026-01-15', 1500000.00, 14000.00, 'year', 'Multi-year home and apartment comprehensive cover', 'ACTIVE'),
(6, 12, 'TR-2024-003', 'Travel Insurance', 'TATA AIG', '2024-03-20', '2025-03-20', 250000.00, 4500.00, 'year', 'Annual multi-trip worldwide travel insurance cover', 'EXPIRED'),
(7, 13, 'EL-2024-004', 'Electronics', 'Bajaj Allianz', '2024-11-10', '2025-11-10', 80000.00, 2200.00, 'year', 'Smartphone and laptop accidental damage protection', 'ACTIVE'),
(8, 9, 'MO-2024-009', 'Motor Insurance', 'ICICI Lombard', '2024-01-01', '2024-06-01', 350000.00, 6000.00, 'year', 'Two-wheeler third party liability insurance', 'CANCELLED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('policies_id_seq', (SELECT MAX(id) FROM policies));

-- 4. Claims
INSERT INTO claims (id, claim_number, customer_id, policy_id, claim_type, incident_title, incident_date, incident_location, incident_description, estimated_loss, requested_amount, additional_remarks, status, priority, assigned_officer_id, assigned_date, assignment_remarks, created_at)
VALUES
(1, 'CLM-1004', 9, 1, 'Vehicle Damage', 'Front bumper damaged in road accident', '2024-10-12', 'Chennai, Tamil Nadu', 'I met with an accident at Anna Salai. The front bumper and left headlight are damaged.', 40000.00, 40000.00, 'Kindly expedite assessment as vehicle is at authorized service center.', 'Under Review', 'High', 2, '2024-10-13 09:15:00', 'Assigned to Officer Rajesh for fast-track review', '2024-10-12 10:30:00'),
(2, 'CLM-1003', 10, 4, 'Property Damage', 'Water leakage in apartment ceiling', '2024-10-05', 'Chennai, Tamil Nadu', 'Heavy rainfall caused ceiling seepage and damaged living room wooden flooring.', 65000.00, 65000.00, 'Plumbing inspection report attached.', 'Documents Required', 'Medium', 2, '2024-10-06 10:00:00', 'Assigned for property verification', '2024-10-05 11:20:00'),
(3, 'CLM-1002', 11, 5, 'Health Insurance', 'Hospitalization for acute appendicitis', '2024-09-20', 'Madurai, Tamil Nadu', 'Underwent emergency appendectomy at Apollo Hospital. Hospital discharge summary and pharmacy bills submitted.', 55000.00, 55000.00, 'All original bills submitted.', 'Approved', 'Medium', 2, '2024-09-21 09:00:00', 'Assigned to health desk', '2024-09-20 14:15:00'),
(4, 'CLM-1001', 9, 1, 'Vehicle Damage', 'Rear bumper dented in parking', '2024-08-10', 'Chennai, Tamil Nadu', 'Another vehicle backed into my car in mall basement parking.', 35000.00, 35000.00, 'Settlement processed swiftly.', 'Settled', 'Low', 2, '2024-08-11 10:30:00', 'Assigned to Officer Rajesh', '2024-08-10 15:00:00'),
(5, 'CLM-1000', 9, 1, 'Vehicle Damage', 'Minor scratch on side door', '2024-01-15', 'Chennai, Tamil Nadu', 'Scratches on left side door while driving through narrow alley.', 12000.00, 12000.00, 'Wear and tear excluded under policy terms.', 'Rejected', 'Low', 2, '2024-01-16 11:00:00', 'Assigned for inspection', '2024-01-15 16:45:00'),
(6, 'CLM-0989', 12, 6, 'Vehicle Damage', 'Front fender collision', '2024-10-06', 'Coimbatore, Tamil Nadu', 'Front fender hit stationary barrier at toll plaza.', 28000.00, 28000.00, 'Police station entry made.', 'Submitted', 'High', 4, '2024-10-07 09:30:00', 'Assigned to Officer Sanjay', '2024-10-06 10:00:00'),
(7, 'CLM-0985', 13, 7, 'Travel', 'Baggage delay in Frankfurt airport', '2024-10-04', 'Frankfurt, Germany', 'Checked-in baggage delayed by 72 hours during international transit flight.', 25000.00, 25000.00, 'PIR report from airline provided.', 'Settled', 'Medium', 6, '2024-10-05 11:00:00', 'Assigned to travel desk', '2024-10-04 12:00:00'),
(8, 'CLM-0981', 14, 1, 'Vehicle Damage', 'Broken windscreen due to loose gravel', '2024-10-01', 'Tiruchirappalli, Tamil Nadu', 'Lorry ahead threw loose stones cracking front windshield.', 18000.00, 18000.00, 'Service center estimate uploaded.', 'Under Review', 'Low', 4, '2024-10-02 10:00:00', 'Windshield claim processing', '2024-10-01 14:30:00'),
(9, 'CLM-0978', 15, 2, 'Health Insurance', 'Daycare eye cataract surgery', '2024-09-29', 'Puducherry', 'Phacoemulsification cataract surgery conducted under daycare scheme.', 42000.00, 42000.00, 'Lens invoice attached.', 'Documents Required', 'High', 5, '2024-09-30 09:30:00', 'Awaiting original hospital bills', '2024-09-29 11:15:00'),
(10, 'CLM-0958', 10, 4, 'Vehicle Damage', 'Engine water intake during heavy waterlogging', '2024-10-10', 'Chennai, Tamil Nadu', 'Vehicle stalled in flooded subway water.', 85000.00, 85000.00, 'Hydrostatic lock endorsement verified.', 'Settled', 'High', 2, '2024-10-11 10:00:00', 'Hydrostatic damage verification', '2024-10-10 16:00:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('claims_id_seq', (SELECT MAX(id) FROM claims));

-- 5. Claim Documents & Photos (CLM-1004 & others)
INSERT INTO claim_documents (id, claim_id, document_type, file_name, stored_path, file_size, file_type, is_photo, photo_category, description, uploaded_by_id, upload_date, review_status, officer_remarks)
VALUES
(1, 1, 'Accident Report', 'accident_report.pdf', 'uploads/CLM-1004/accident_report.pdf', 524288, 'application/pdf', FALSE, NULL, 'Official driver statement and accident report', 9, '2024-10-12 10:35:00', 'Accepted', 'Incident description is clear and aligns with accident details'),
(2, 1, 'Repair Estimate', 'repair_estimate.pdf', 'uploads/CLM-1004/repair_estimate.pdf', 460800, 'application/pdf', FALSE, NULL, 'Estimate provided by authorized service center', 9, '2024-10-15 14:30:00', 'Accepted', 'Parts and labor rates are standard and accepted'),
(3, 1, 'Vehicle RC Copy', 'vehicle_rc.pdf', 'uploads/CLM-1004/vehicle_rc.pdf', 327680, 'application/pdf', FALSE, NULL, 'Registration certificate of the damaged car', 9, '2024-10-12 10:35:00', 'Accepted', 'Ownership verified with policy holder name'),
(4, 1, 'Damage Photograph', 'accident_photo1.jpg', 'uploads/CLM-1004/accident_photo1.jpg', 2516582, 'image/jpeg', TRUE, 'Front Bumper Damage', 'Close-up of front bumper crack and broken headlight grill', 9, '2024-10-12 10:35:00', 'Accepted', 'Damage matches accident details'),
(5, 1, 'Damage Photograph', 'accident_photo2.jpg', 'uploads/CLM-1004/accident_photo2.jpg', 2097152, 'image/jpeg', TRUE, 'Headlight Damage', 'Side angle showing dislodged front left headlamp assembly', 9, '2024-10-12 10:35:00', 'Accepted', 'Photographs verified');

SELECT setval('claim_documents_id_seq', (SELECT MAX(id) FROM claim_documents));

-- 6. Document Requests
INSERT INTO document_requests (id, claim_id, officer_id, document_type, is_mandatory, remarks, due_date, status, requested_at, fulfilled_at)
VALUES
(1, 1, 2, 'Repair Estimate', TRUE, 'Please upload a clear repair estimate from the authorized service center.', '2024-10-20', 'FULFILLED', '2024-10-14 11:00:00', '2024-10-15 14:30:00'),
(2, 2, 2, 'Purchase Invoice', TRUE, 'Please provide the original wooden flooring installation invoice.', '2024-10-18', 'PENDING', '2024-10-06 14:00:00', NULL),
(3, 9, 5, 'Police Complaint', FALSE, 'Please provide police acknowledgment copy if available.', '2024-10-15', 'PENDING', '2024-09-30 11:00:00', NULL);

SELECT setval('document_requests_id_seq', (SELECT MAX(id) FROM document_requests));

-- 7. Assessments
INSERT INTO claim_assessments (id, claim_id, officer_id, assessment_date, assessed_loss, eligible_amount, non_eligible_amount, remarks, recommendation)
VALUES
(1, 3, 2, '2024-09-24', 55000.00, 50000.00, 5000.00, 'Appendectomy surgery covered. Room rent deduction of ₹5,000 as per policy terms.', 'Approve'),
(2, 4, 2, '2024-08-15', 38000.00, 35000.00, 3000.00, 'Bumper repair and paint approved. Deductible of ₹3,000 applied.', 'Approve'),
(3, 1, 2, '2024-10-16', 38000.00, 36000.00, 2000.00, 'Damage to front bumper and left headlight verified from documents. Repair estimate is reasonable.', 'Approve');

SELECT setval('claim_assessments_id_seq', (SELECT MAX(id) FROM claim_assessments));

-- 8. Claim Decisions
INSERT INTO claim_decisions (id, claim_id, decided_by_id, decision, approved_amount, decision_date, remarks, rejection_reason)
VALUES
(1, 3, 1, 'Approved', 50000.00, '2024-09-25 10:00:00', 'Assessment verified and eligible claim approved for settlement.', NULL),
(2, 4, 1, 'Approved', 35000.00, '2024-08-16 11:30:00', 'Repair invoices verified and approved.', NULL),
(3, 5, 1, 'Rejected', 0.00, '2024-01-18 14:00:00', 'Cosmetic paint scratches without accidental collision are excluded.', 'Policy Exclusion: Minor cosmetic scratches without third party or collision impact');

SELECT setval('claim_decisions_id_seq', (SELECT MAX(id) FROM claim_decisions));

-- 9. Settlements
INSERT INTO settlements (id, claim_id, approved_amount, settlement_amount, settlement_date, settlement_reference, status, remarks)
VALUES
(1, 4, 35000.00, 35000.00, '2024-08-20', 'SETTL-2024-8841', 'Completed', 'Settlement payment recorded successfully to customer bank mandate.'),
(2, 3, 50000.00, 50000.00, '2024-09-28', 'SETTL-2024-9120', 'Completed', 'Hospital cashless settlement completed.');

SELECT setval('settlements_id_seq', (SELECT MAX(id) FROM settlements));

-- 10. Claim Timeline Events (CLM-1004)
INSERT INTO claim_timeline_events (claim_id, event_name, user_id, user_name, remarks, event_time)
VALUES
(1, 'Claim Submitted', 9, 'Arun Kumar', 'Claim submitted by customer', '2024-10-12 10:30:00'),
(1, 'Assigned to Officer', 1, 'Admin Kumar', 'Assigned to Officer Rajesh', '2024-10-13 09:15:00'),
(1, 'Documents Requested', 2, 'Rajesh Kumar', 'Requested repair estimate', '2024-10-14 11:00:00'),
(1, 'Documents Uploaded', 9, 'Arun Kumar', 'Customer uploaded documents', '2024-10-15 14:30:00'),
(1, 'Under Review', 2, 'Rajesh Kumar', 'Claim is under review', '2024-10-16 09:00:00');

-- 11. Claim Notes
INSERT INTO claim_notes (claim_id, user_id, user_name, note, is_internal, created_at)
VALUES
(1, 2, 'Rajesh Kumar', 'Initial inspection shows damage is consistent with Anna Salai collision description. Cross-checked with workshop estimate.', TRUE, '2024-10-16 09:30:00'),
(1, 1, 'Admin Kumar', 'Customer called helpline requesting expedited settlement. Priority set to High.', TRUE, '2024-10-13 14:00:00');

-- 12. Notifications
INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
VALUES
-- Customer Notifications (matching Screenshot 1)
(9, 'Additional documents requested', 'CLM-1002 - Please upload repair estimate.', 'DOCUMENT', '/customer/claims/1', FALSE, '2024-10-14 11:00:00'),
(9, 'Claim under review', 'CLM-1004 is now under review.', 'CLAIM', '/customer/claims/1', FALSE, '2024-10-16 09:00:00'),
(9, 'Claim approved', 'CLM-1002 has been approved.', 'CLAIM', '/customer/claims/3', TRUE, '2024-09-20 10:30:00'),
(9, 'Claim settled', 'CLM-1001 has been settled.', 'SETTLEMENT', '/customer/claims/4', TRUE, '2024-08-10 16:15:00'),

-- Officer Notifications (matching Screenshot 2)
(2, 'Customer uploaded a new document', 'CLM-1003 - Repair estimate.pdf', 'DOCUMENT', '/officer/claims/2', FALSE, '2024-10-14 11:00:00'),
(2, 'New claim assigned to you', 'CLM-1004 - Vehicle Insurance', 'ASSIGNMENT', '/officer/claims/1', FALSE, '2024-10-13 09:30:00'),
(2, 'Document review required', 'CLM-0978 - Police complaint pending', 'DOCUMENT', '/officer/claims/9', TRUE, '2024-10-12 16:15:00'),
(2, 'Assessment due soon', 'CLM-0950 - 5 days in review', 'CLAIM', '/officer/claims/5', TRUE, '2024-10-11 14:20:00'),

-- Admin Notifications (matching Screenshot 3)
(1, 'New claim submitted', 'CLM-1004 - Arun Kumar - Vehicle Insurance', 'CLAIM', '/admin/claims/1', FALSE, '2024-10-12 10:30:00'),
(1, 'Document uploaded', 'CLM-1003 - Priya S - Repair estimate', 'DOCUMENT', '/admin/claims/2', FALSE, '2024-10-14 11:00:00'),
(1, 'Claim assigned', 'CLM-1002 - Assigned to Rajesh Kumar', 'ASSIGNMENT', '/admin/claims/3', TRUE, '2024-09-21 09:00:00'),
(1, 'Claim approved', 'CLM-0958 - Settlement completed', 'CLAIM', '/admin/claims/10', TRUE, '2024-10-11 10:00:00'),
(1, 'Policy expired', 'Policy HO-2023-005 - Karthik R', 'SYSTEM', '/admin/policies', TRUE, '2024-10-10 09:00:00');

-- 13. System Settings (matching Screenshot 3)
INSERT INTO system_settings (setting_key, setting_value, category)
VALUES
('company_name', 'ClaimDesk Insurance', 'GENERAL'),
('support_email', 'support@company.com', 'GENERAL'),
('system_timezone', '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi', 'GENERAL'),
('date_format', 'DD MMM YYYY (12 Oct 2024)', 'GENERAL'),
('email_notifications_enabled', 'true', 'NOTIFICATIONS'),
('auto_assignment_enabled', 'false', 'SYSTEM'),
('retention_period_years', '7', 'SYSTEM')
ON CONFLICT (setting_key) DO NOTHING;
