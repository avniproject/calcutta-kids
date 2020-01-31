--voided SES encounter after 01-Nov-2019
with audit_ids as (
    update encounter set is_voided = true where encounter_date_time >= '11-01-2019'
        and encounter_type_id = (select id from encounter_type et where et.name = 'SES Survey')
        returning audit_id
)
update audit
set last_modified_date_time = current_timestamp,
    last_modified_by_id     = (select id from users where username = 'dataimporter@ck')
where id in ((select audit_id from audit_ids))