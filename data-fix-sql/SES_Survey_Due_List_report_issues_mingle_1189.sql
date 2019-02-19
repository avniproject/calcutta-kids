--exit those individuals from mother program who has no child enrolled in child program and is not in pregnancy program

with to_be_exited as (
    select distinct program_enrolment.id
    from individual
           join program_enrolment on program_enrolment.individual_id = individual.id
           join program on program.id = program_enrolment.program_id
    where program.name in ('CK Mother')
      and individual.id not in (select distinct ir.individual_a_id
                                from individual
                                       join program_enrolment on program_enrolment.individual_id = individual.id
                                       join program on program.id = program_enrolment.program_id
                                       join individual_relationship ir on (ir.individual_b_id = individual.id)
                                where program_enrolment.program_exit_date_time is null
                                  and program.name in ('Child'))
      and individual.id not in (select distinct individual.id
                                from individual
                                       join program_enrolment on program_enrolment.individual_id = individual.id
                                       join program on program.id = program_enrolment.program_id
                                where program_enrolment.program_exit_date_time is null
                                  and program.name in ('Mother'))
    ),
updates as (
    update program_enrolment
    set program_exit_date_time=current_timestamp,
      program_exit_observations = '{"5a2fca73-f3b6-4b7a-bc04-5fd8f5993fa1": "f63a0122-8156-4956-a29c-c0722ff22a89"}'
    where id in (select id from to_be_exited)
    returning audit_id
)
update audit a
set last_modified_date_time = current_timestamp + id * ('1 millisecond' :: interval), last_modified_by_id = 85, created_by_id = 85
from updates
where updates.audit_id = a.id;