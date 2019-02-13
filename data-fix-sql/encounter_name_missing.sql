set role calcutta_kids;

-- view all encounters missing names

select op.name, et.name, count(*)
from program_encounter
       join encounter_type et on program_encounter.encounter_type_id = et.id
       join program_enrolment enrolment on program_encounter.program_enrolment_id = enrolment.id
       join operational_program op on op.program_id = enrolment.program_id
where earliest_visit_date_time notnull
  and program_encounter.name is null
  and program_encounter.is_voided is not true
group by 1, 2
order by 2, 1;


-- update all encounter missing encounter name
with audits as (update program_encounter
set name = 'Child GMP'
where earliest_visit_date_time notnull
      and name is null
      and is_voided is not true
      and encounter_type_id = (select encounter_type_id from operational_encounter_type where name = 'Child GMP')
returning audit_id)
update audit as a
set last_modified_date_time = current_timestamp
from audits as audits
where audits.audit_id = a.id;

-- other encounter type
-- Mother|	Doctor Visit	|1 encounter
-- Pregnancy|	Lab Tests	|1 encounter
-- fix these  manually

