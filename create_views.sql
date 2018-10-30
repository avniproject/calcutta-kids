create or replace view calcutta_kids_individual_away_status as
(select i.id,
       encounter.cancel_observations @>
       '{"739f9a56-c02c-4f81-927b-69842d78c1e8":"5b30a5b5-8ab5-4643-a424-2992f2b8df11"}' as is_away
from individual i
       left join program_enrolment enrolment on i.id = enrolment.individual_id
       left join latest_program_encounter encounter on enrolment.id = encounter.program_enrolment_id);

GRANT ALL ON ALL TABLES IN SCHEMA public TO calcutta_kids;
