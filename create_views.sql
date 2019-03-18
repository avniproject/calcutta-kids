set role calcutta_kids;

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
select i.* from individual i
                    left outer join program_enrolment enrolment on i.id = enrolment.individual_id
                    left outer join program_encounter encounter on enrolment.id = encounter.program_enrolment_id
  where (encounter.encounter_date_time > (current_timestamp - interval '5 months 1 seconds')
           or enrolment.enrolment_date_time > (current_timestamp - interval '5 months 1 seconds'))
  group by i.id;

set role none;

select grant_all_on_views(array [
                            'calcutta_kids_individual_away_status',
                            'active_individuals'
                            ], 'calcutta_kids');