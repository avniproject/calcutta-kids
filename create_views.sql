drop view if exists calcutta_kids_individual_away_status;

create view calcutta_kids_individual_away_status as

(select i.id individual_id,
      case when encounter.cancel_observations @>
       '{"739f9a56-c02c-4f81-927b-69842d78c1e8":"5b30a5b5-8ab5-4643-a424-2992f2b8df11"}' = true
       then 'Yes' else 'No' end as is_away
from latest_program_encounter encounter
      inner join program_enrolment enrolment on enrolment.id = encounter.program_enrolment_id
      right join individual i on enrolment.individual_id = i.id);

GRANT ALL ON ALL TABLES IN SCHEMA public TO calcutta_kids;
