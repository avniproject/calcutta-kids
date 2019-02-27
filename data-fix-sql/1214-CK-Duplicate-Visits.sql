with duplicates as (
    select
           enl.id as enl_id,
           oet.name as oet_name,
           to_char(earliest_visit_date_time, 'YYYY-MM-DD') schedule_date,
           count(program_encounter.id)
    from program_encounter program_encounter
           join operational_encounter_type oet on oet.encounter_type_id = program_encounter.encounter_type_id
           join program_enrolment enl on enl.id = program_enrolment_id
    where 1=1
      and extract('year' from earliest_visit_date_time) not in( 1900,1990)
      and cancel_date_time ISNULL
      and encounter_date_time ISNULL
      and program_encounter.is_voided is not true
      and enl.is_voided is not true
      and enl.program_exit_date_time isnull
        --and oet.name in ('Child Home Visit')
    group by to_char(earliest_visit_date_time, 'YYYY-MM-DD'), oet.id, enl.id
    having count(program_encounter.id) > 1
),
to_be_voided as (
      select * from (
          select to_char(earliest_visit_date_time, 'YYYY-MM-DD') schedule_date,
                 earliest_visit_date_time,
                 oet.name as oet_name,
                 enl.id as enrolment_id,
                 program_encounter.id as enc_id,
                 program_encounter.cancel_observations,
                 row_number() over (partition by enl.id, to_char(earliest_visit_date_time, 'YYYY-MM-DD'), oet.name order by program_encounter.id desc) row_num,
                 a.last_modified_date_time,
                 a.last_modified_by_id,
                 a.created_date_time,
                 a.created_by_id
          from program_encounter program_encounter
                 join operational_encounter_type oet on oet.encounter_type_id = program_encounter.encounter_type_id
                 join program_enrolment enl on enl.id = program_enrolment_id
                 join individual i on enl.individual_id = i.id
                 join address_level ad on i.address_id = ad.id
                 join audit a on program_encounter.audit_id = a.id
                 join duplicates on enl.id = duplicates.enl_id
          where 1=1
            and extract('year' from earliest_visit_date_time) not in( 1900,1990)
            and cancel_date_time ISNULL
            and encounter_date_time ISNULL
            and oet.name = duplicates.oet_name
            and to_char(earliest_visit_date_time, 'YYYY-MM-DD') = duplicates.schedule_date
            and program_encounter.is_voided is not true
            and enl.is_voided is not true
            and enl.program_exit_date_time isnull
          order by enrolment_id, schedule_date, oet_name, enc_id) foo
where foo.row_num <> 1)
-- below line is to check that the update worked
-- select enc_id from to_be_voided;

, updates as (
  update program_encounter set is_voided=true
  where id in (select enc_id from to_be_voided)
  returning audit_id
)

update audit a
set last_modified_date_time = current_timestamp + id * ('1 millisecond' :: interval), last_modified_by_id = 85, created_by_id = 85
from updates
where updates.audit_id = a.id;