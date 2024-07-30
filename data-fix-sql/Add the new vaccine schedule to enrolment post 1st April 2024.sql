--------------------------------------------------------------------------------------------------------------------------------------------------
--1. DPT-Booster --> '0360c9f6-dad8-45a8-91c6-ca8c0f8b9f4d'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '0360c9f6-dad8-45a8-91c6-ca8c0f8b9f4d'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '0360c9f6-dad8-45a8-91c6-ca8c0f8b9f4d'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--2. JE-1 --> '30de9255-f205-442c-8491-6f72ab705f37'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '30de9255-f205-442c-8491-6f72ab705f37'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '30de9255-f205-442c-8491-6f72ab705f37'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--3. JE-2 --> '7e13e2f1-3a8a-4be3-9a31-6dd8e7535107'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '7e13e2f1-3a8a-4be3-9a31-6dd8e7535107'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '7e13e2f1-3a8a-4be3-9a31-6dd8e7535107'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--4. PCV-1 --> '9dc5dd88-ff22-4e35-97d3-d6d0ee0f3648'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '9dc5dd88-ff22-4e35-97d3-d6d0ee0f3648'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '9dc5dd88-ff22-4e35-97d3-d6d0ee0f3648'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--5. PCV-2 --> '6967bb7c-9054-4ae7-b0c0-766f079e2807'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '6967bb7c-9054-4ae7-b0c0-766f079e2807'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '6967bb7c-9054-4ae7-b0c0-766f079e2807'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--6. PCV-Booster --> '2f6542ba-4446-4ff5-aae7-d566835ebd74'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = '2f6542ba-4446-4ff5-aae7-d566835ebd74'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = '2f6542ba-4446-4ff5-aae7-d566835ebd74'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--7. Rota-1 --> 'e91ebdda-9d39-40b0-aa3c-31e5d5b8bb3a'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = 'e91ebdda-9d39-40b0-aa3c-31e5d5b8bb3a'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = 'e91ebdda-9d39-40b0-aa3c-31e5d5b8bb3a'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--8. Rota-2 --> 'db9a6f47-6287-4d04-9887-769a8ebc6b94'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = 'db9a6f47-6287-4d04-9887-769a8ebc6b94'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = 'db9a6f47-6287-4d04-9887-769a8ebc6b94'
	)
	AND enl.enrolment_date_time > '2024-04-01';

	
	
--------------------------------------------------------------------------------------------------------------------------------------------------
--9. Rota-3 --> 'a3fae072-d341-478d-9cc7-60a2576873f8'
SET ROLE calcutta_kids;

INSERT INTO checklist_item(completion_date, checklist_id, uuid, version , organisation_id, audit_id, observations, checklist_item_detail_id, last_modified_by_id, last_modified_date_time, created_by_id , created_date_time)
SELECT
	NULL,
	checklist.id,
	uuid_generate_v4(),?
	0,
	(SELECT id FROM organisation o WHERE o."name" = 'Calcutta Kids'),
	create_audit((SELECT id FROM users WHERE username = 'adam@calcutta_kids')),
    '{}'::jsonb,
	(SELECT id FROM checklist_item_detail WHERE uuid = 'a3fae072-d341-478d-9cc7-60a2576873f8'),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')),
	(SELECT id FROM users WHERE username = 'adam@calcutta_kids'),
	current_timestamp + (random() * 5000 * (interval '1 millisecond')) 
FROM
	program_enrolment enl
JOIN checklist ON
	checklist.program_enrolment_id = enl.id
WHERE
	enl.id NOT IN (
		SELECT
			enl.id
		FROM
			program_enrolment enl
		JOIN "program" p ON 
			p.id = enl.program_id AND 
			p.name = 'Child'
		JOIN checklist ON
			checklist.program_enrolment_id = enl.id
		JOIN checklist_item ON
			checklist.id = checklist_item.checklist_id
		JOIN checklist_item_detail cid ON
			checklist_item.checklist_item_detail_id = cid.id
		WHERE
			cid.uuid = 'a3fae072-d341-478d-9cc7-60a2576873f8'
	)
	AND enl.enrolment_date_time > '2024-04-01';
