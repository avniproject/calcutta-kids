select create_db_user('calcutta_kids', 'password');

INSERT into organisation(name, db_user, uuid, parent_organisation_id)
SELECT 'Calcutta Kids', 'calcutta_kids', '2a0cc644-5a8f-4bc3-8483-dc1e00adaba4', id
FROM organisation
WHERE name = 'OpenCHS' and not exists (select 1 from organisation where name = 'Calcutta Kids');