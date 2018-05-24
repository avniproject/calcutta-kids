CREATE ROLE calcutta_kids NOINHERIT PASSWORD 'password';

GRANT calcutta_kids TO openchs;

GRANT ALL ON ALL TABLES IN SCHEMA public TO calcutta_kids;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO calcutta_kids;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO calcutta_kids;

INSERT into organisation(name, db_user, uuid, parent_organisation_id)
    SELECT 'Calcutta Kids', 'calcutta_kids', '2a0cc644-5a8f-4bc3-8483-dc1e00adaba4', id FROM organisation WHERE name = 'OpenCHS';
