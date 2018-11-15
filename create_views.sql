drop view if exists calcutta_kids_individual_away_status;

create view calcutta_kids_individual_away_status as

(select i.id individual_id,
      case when encounter.cancel_observations @>
       '{"739f9a56-c02c-4f81-927b-69842d78c1e8":"5b30a5b5-8ab5-4643-a424-2992f2b8df11"}' = true
       then 'Yes' else 'No' end as is_away
from latest_program_encounter encounter
      inner join program_enrolment enrolment on enrolment.id = encounter.program_enrolment_id
      right join individual i on enrolment.individual_id = i.id);

drop view if exists active_individuals;

create or replace view active_individuals as
select distinct i.* from program_encounter pe
      inner join program_enrolment e on pe.program_enrolment_id = e.id
      inner join individual i on e.individual_id=i.id
      where pe.encounter_date_time > current_timestamp - interval '5 months 1 seconds' or e.enrolment_date_time > current_timestamp - interval '5 months 1 seconds'
      group by e.individual_id, i.id;

GRANT ALL ON ALL TABLES IN SCHEMA public TO calcutta_kids;
