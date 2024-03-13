## **Removing Dependency from Org1 for Calcutta Kids Implementation**

### Objective:

The primary objective of this documentation is to remove the dependency of the Calcutta Kids organization's
implementation from Org1.

### Steps Taken:

#### Step 1: Database Backup and Storage rest

1. Create a manual backup of prod db just before starting the migration steps
2. Ask users to perform fast-sync setup for their catchments
3. Stop Avni-etl server
4. Stop Avni-integration-server
5. Change app.avniproject.org and server.avniproject.org to apps.avniproject.org and servers.avniproject.org

#### Step 2: Upload Org1 Metadata.zip file into Org2

    1. Fix users to avoid login issues
        1. To set superadmin organization_id to null
```sql
UPDATE users SET organisation_id = null::integer WHERE id = 64::integer
```
        2. Create accountAdmin entry
```sql
INSERT INTO public.account_admin (id, name, account_id, admin_id) VALUES (DEFAULT, 'superadmin'::varchar(255), 1::integer, 64::integer)
```
    2. Backup explicit group_privileges for "Everyone" group. For calcutta_kids org, remove explicit group_privileges
       for "Everyone" group
       -    Make a note of group_privilege ids_list using below query
```sql
    select gp.id
    from group_privilege gp
    join groups g on gp.group_id = g.id
    where gp.organisation_id = 19
    and gp.is_voided = false;
--     Store above output as <ids_list>

    UPDATE public.groups
    SET last_modified_date_time = now(),
        is_voided               = true::boolean
    WHERE id = 796::integer;
    
    UPDATE group_privilege
    set last_modified_date_time = now(),
        is_voided               = true
    where id in (<ids_list>);
```
    3. Create default genders for the org
```sql
  insert into public.gender (id, uuid, name, concept_id, version, audit_id, is_voided, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  values  (default, 'ad7d1d14-54fd-45a2-86b7-ea329b744484', 'Female', null, 1, create_audit(), false, 19, 1, 1, now(), now()),
          (default, '840de9fb-e565-4d7d-b751-90335ba20490', 'Male', null, 1, create_audit(), false, 19, 1, 1, now(), now()),
          (default, '188ad77e-fe46-4328-b0e2-98f3a05c554c', 'Other', null, 1, create_audit(), false, 19, 1, 1, now(), now());
```
    4. Login to app as superadmin and download bundle from Org1
       1. Create orgConfig entry temporarily for org1
```sql
INSERT INTO public.organisation_config (id, uuid, organisation_id, settings, audit_id, version, is_voided, worklist_updation_rule, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, export_settings) VALUES (DEFAULT, '012771cf-910e-45c5-9a33-26a83a72e031', 1, '{"languages": ["en", "hi_IN"], "searchFilters": [{"type": "Name", "titleKey": "Name", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Age", "titleKey": "Age", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "SearchAll", "titleKey": "SearchAll", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}], "myDashboardFilters": [{"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}]}', 699426, 0, false, '', 39, 2451, '2019-11-06 06:33:51.920 +00:00', '2023-11-17 07:19:01.576 +00:00', '{}');
```
       2. Login as "openchs_org_admin@openchs_impl" and download bundle (avni-webapp-basepath/#/appdesigner/bundle)
       3. delete orgConfig entry for org1
```sql
 DELETE FROM public.organisation_config WHERE openchs.public.organisation_config.organisation_id = 1;
```
    5. **Logout** and Login to app as org2 admin user, navigate to bundle upload screen
BREATHE - 1,2,3,4,5

    6. Update and Set parent_orgnization_id as null
```sql
    update public.organisation set parent_organisation_id = null where id = 19;
```
BREATHE, commit transaction

    7. upload Metadata.zip file, ensure there are no failures other than those mentioned below. Access S3 to view the error csv file.
        - Ignore the following failures:
            - AddressLevelTypes.json : All types are voided and org uses its own defined AddressLevelTypes
    8. Ensure that the organisation_config is not overwritten, if yes, correct it
  ```sql
  UPDATE public.organisation_config
  SET last_modified_date_time = now(), uuid = '012771cf-910e-45c5-9a33-26a83a72e032', settings = '{"languages": ["en", "hi_IN"], "searchFilters": [{"type": "Name", "titleKey": "Name", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Age", "titleKey": "Age", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "SearchAll", "titleKey": "SearchAll", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}], "myDashboardFilters": [{"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}]}'
  WHERE id = 8;
  ```

#### Step 3: Metadata Entities that are to be updated:

**1. To update the `form_mapping` Table:**
Loading Avni webapp for target org will fail until the below commands are run to correct the form mappings.

```sql
update form_mapping
set subject_type_id         =
        (select id
         from subject_type
         where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3'
           and organisation_id = 19)
where subject_type_id = 1
  and organisation_id = 19;
```

```sql
update form_mapping fg_target
set form_id                 = newform.id
from form_mapping as fg_source
         join form "org1form" on fg_source.form_id = org1form.id
         join form newform on org1form.uuid = newform.uuid and newform.organisation_id = 19
where fg_target.id = fg_source.id
  and fg_source.organisation_id = 19
  and fg_source.form_id != newform.id;
```

```sql
update form_mapping fm_target
set entity_id               = newprogram.id
from form_mapping fm_source
         join program org1program on fm_source.entity_id = org1program.id
         join program newprogram on org1program.uuid = newprogram.uuid and newprogram.organisation_id = 19
where fm_source.uuid in (select uuid
                         from form_mapping
                         where organisation_id = 19
                           and entity_id in (1, 2, 3))
  and fm_target.uuid = fm_source.uuid
  and fm_target.organisation_id = 19
  and fm_target.entity_id <> newprogram.id;
```

```sql
update form_mapping fm_target
set observations_type_entity_id = newet.id
from form_mapping fm_source
         join encounter_type org1et on fm_source.observations_type_entity_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where fm_source.uuid in (select uuid
                         from form_mapping
                         where organisation_id = 19)
  and fm_target.id = fm_source.id
  and fm_target.organisation_id = 19
  and fm_target.observations_type_entity_id <> newet.id;
```

**2. To update the `operational_subject_type` Table:**

```sql
update operational_subject_type
set subject_type_id         = (select id
                               from subject_type
                               where organisation_id = 19
                                 and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where subject_type_id = 1
  and organisation_id = 19;
```

**3. To update the `operational_program` Table:**

```sql
update operational_program op_target
set program_id              = newprog.id
from operational_program op_source
         join program org1prog on op_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where op_source.program_id in (1, 2, 3)
  and op_target.id = op_source.id
  and op_target.organisation_id = 19
  and op_target.program_id != newprog.id;
```

**4. To update the `program_organisation_config` Table:**

```sql
select * from program_organisation_config;

insert into public.program_organisation_config (id, uuid, program_id, organisation_id, visit_schedule, version, audit_id, is_voided, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) values (DEFAULT, uuid_generate_v4(), 1, 19, '[]', 0, create_audit(), false, 1, 1, '2018-11-05 11:49:27.062 +00:00', '2018-11-05 11:49:27.062 +00:00');
insert into public.program_organisation_config (id, uuid, program_id, organisation_id, visit_schedule, version, audit_id, is_voided, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) values (DEFAULT, uuid_generate_v4(), 3, 19, '[]', 0, create_audit(), false, 1, 1, '2018-11-05 11:49:42.481 +00:00', '2018-11-05 11:49:42.481 +00:00');

update program_organisation_config poc_target
set program_id              = newprog.id
from program_organisation_config poc_source
         join program org1prog on poc_source.program_id = org1prog.id and org1Prog.organisation_id = 1
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where poc_target.id = poc_source.id
  and poc_target.organisation_id = 19
  and poc_target.program_id != newprog.id;

```

**5. To update the `group_privilege` Table:**
Migration was not required for `encounter_type_id` as the records were already updated with organization 19, but it was
necessary for `subject_type_id` and `program_encounter_type_id`.

```sql

UPDATE public.group_privilege
set subject_type_id = (select id
                       from subject_type
                       where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3'
                         and organisation_id = 19)
where subject_type_id = 1 and organisation_id = 19;

UPDATE public.group_privilege p_target
set program_id              = newprog.id
from public.group_privilege p_source
         join program org1prog on p_source.program_id = org1prog.id
         join program newprog on org1prog.uuid = newprog.uuid and newprog.organisation_id = 19
where org1prog.organisation_id = 1
  and p_source.organisation_id = 19
  and p_target.organisation_id = 19
  and p_target.id = p_source.id
  and p_target.program_id != newprog.id;

update public.group_privilege e_target
set program_encounter_type_id = newet.id
from public.group_privilege e_source
         join encounter_type org1et on e_source.program_encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where org1et.organisation_id = 1
  and e_source.organisation_id = 19
  and e_target.organisation_id = 19
  and e_target.id = e_source.id
  and e_target.program_encounter_type_id != newet.id;

update public.group_privilege e_target
set encounter_type_id = newet.id
from public.group_privilege e_source
         join encounter_type org1et on e_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where org1et.organisation_id = 1
  and e_source.organisation_id = 19
  and e_target.organisation_id = 19
  and e_target.id = e_source.id
  and e_target.encounter_type_id != newet.id;
  
```

**6. To update the `operational_encounter_type` Table:**

```sql
update operational_encounter_type oet_target
set encounter_type_id       = newet.id
from operational_encounter_type oet_source
         join encounter_type org1et on oet_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where oet_target.uuid in (
    select oet.uuid
    from operational_encounter_type oet
             join encounter_type et on oet.encounter_type_id = et.id
    where et.organisation_id = 1
)
  and oet_target.uuid = oet_source.uuid
  and oet_target.organisation_id = 19
  and oet_target.encounter_type_id != newet.id;
```

**7. Update concept_id for checklist_item_detail**

```sql
select c.id, newc.id
from checklist_item_detail cid
         join concept c on cid.concept_id = c.id
         left join concept newc on newc.uuid = c.uuid and newc.organisation_id = 19
where cid.organisation_id = 19;


update checklist_item_detail cid_target
set concept_id              = newcon.id
from checklist_item_detail as cid_source
         join concept org1con on cid_source.concept_id = org1con.id
         join concept newcon on org1con.uuid = newcon.uuid and newcon.organisation_id = 19
where cid_target.id = cid_source.id
  and cid_source.organisation_id = 19
  and cid_source.concept_id != newcon.id;
```

**7.b. Void Extraneous Checklist form**

```sql
update form set is_voided = true where uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826' and organisation_id = 19;
```

**8. Update form_id for form_element_group**

```sql
update form_element_group fg_target
set form_id                 = newform.id
from form_element_group as fg_source
         join form "org1form" on fg_source.form_id = org1form.id
         join form newform on org1form.uuid = newform.uuid and newform.organisation_id = 19
where fg_target.id = fg_source.id
  and fg_source.organisation_id = 19
  and fg_source.form_id != newform.id;
```

**9. Fix data issue with overlapping display order of unused form_elements**
Fix data issue with overlapping display order of unused form_elements created in calcutta_kids org through webapp.
Issue occurs due to org id now being merged.

```sql
delete
from form_element
where id in (1422, 1423, 1424);
```

**10. Update form_element_group for form_element**

```sql
update form_element fe_target
set form_element_group_id   = newfeg.id
from form_element as fe_source
         join form_element_group org1feg on fe_source.form_element_group_id = org1feg.id
         join form_element_group newfeg on org1feg.uuid = newfeg.uuid and newfeg.organisation_id = 19
where fe_target.id = fe_source.id
  and fe_source.organisation_id = 19
  and fe_source.display_order != newfeg.id
  and fe_source.form_element_group_id != newfeg.id;
```

```sql
update form_element fe_target
set concept_id              = newconcept.id
from form_element fe_source
         join concept org1concept on fe_source.concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where fe_target.id = fe_source.id
  and fe_source.organisation_id = 19
  and fe_target.concept_id != newconcept.id;
```

**11. Update concept_answer**

```sql
update concept_answer ca_target
set concept_id              = newconcept.id
from concept_answer ca_source
         join concept org1concept on ca_source.concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where ca_source.uuid in (select uuid
                         from concept_answer
                         where organisation_id = 19)
  and ca_target.uuid = ca_source.uuid
  and ca_target.organisation_id = 19
  and ca_target.concept_id <> newconcept.id;
```

```sql
update concept_answer ca_target
set answer_concept_id       = newconcept.id
from concept_answer ca_source
         join concept org1concept on ca_source.answer_concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where ca_source.uuid in (select uuid
                         from concept_answer
                         where organisation_id = 19)
  and ca_target.uuid = ca_source.uuid
  and ca_target.organisation_id = 19
  and ca_target.answer_concept_id <> newconcept.id;
```

Below sql is used to correct the difference in uuids between the new and old concept_answer entities caused due to spring recreating them during bundle upload. Otherwise, after performing sync from users who are already logged in before migration, they'll observe duplicate answers for the org1 sourced coded concept questions
```sql
with duplicates as (select c.uuid conuuid, cc.uuid ansuuid, count(*)
                    from concept c
                             join concept_answer ca on ca.concept_id = c.id
                             join concept cc on ca.answer_concept_id = cc.id
                    where
--       c.name = 'Floor'
-- and
c.organisation_id in (1, 19)
                    group by 1, 2
                    having count(*) > 1)
update concept_answer ca_target
set uuid = ca_source.uuid
from concept_answer ca_source
         join concept org1concept on ca_source.concept_id = org1concept.id and org1concept.organisation_id = 1
         join concept org1answer on ca_source.answer_concept_id = org1answer.id and org1answer.organisation_id = 1
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
         join concept newanswer on org1answer.uuid = newanswer.uuid and newanswer.organisation_id = 19
         join duplicates dup on dup.conuuid = org1concept.uuid and dup.ansuuid = org1answer.uuid
where ca_target.concept_id = newconcept.id
  and ca_target.answer_concept_id = newanswer.id
  and ca_target.uuid != ca_source.uuid;
```

**12. Update relationship_type_id for individual_relationship**

```sql
update public.individual_relationship ir_target
set relationship_type_id    = newirt.id
from public.individual_relationship as ir_source
         join individual_relationship_type org1irt on ir_source.relationship_type_id = org1irt.id
         join individual_relationship_type newirt on org1irt.uuid = newirt.uuid and newirt.organisation_id = 19
where ir_target.id = ir_source.id
  and ir_source.organisation_id = 19
  and ir_source.relationship_type_id != newirt.id;
```

**13. Update uuid for individual_relation_gender_mapping**
Below sql is used to correct the difference in uuids between the new and old individual_relation_gender_mapping entities caused due to spring recreating them during bundle upload. Otherwise, after performing sync from users who are already logged in before migration, they'll observe duplicate stale mappings.

```sql
with duplicates as (select g.uuid genuuid, ir.uuid reluuid from gender g
                             join individual_relation_gender_mapping irgm on irgm.gender_id = g.id
                             join individual_relation ir on irgm.relation_id = ir.id
                    where
                            irgm.organisation_id in (1, 19)
                    group by 1, 2
                    having count(*) > 1)
update individual_relation_gender_mapping irgm_target
set uuid = irgm_source.uuid
from individual_relation_gender_mapping irgm_source
         join gender org1gender on irgm_source.gender_id = org1gender.id and org1gender.organisation_id = 1
         join individual_relation org1relation on irgm_source.relation_id = org1relation.id and org1relation.organisation_id = 1
         join gender newgender on org1gender.uuid = newgender.uuid and newgender.organisation_id = 19
         join individual_relation newrelation on org1relation.uuid = newrelation.uuid and newrelation.organisation_id = 19
         join duplicates dup on dup.genuuid = org1gender.uuid and dup.reluuid = org1relation.uuid
where irgm_target.gender_id = newgender.id
  and irgm_target.relation_id = newrelation.id
  and irgm_target.uuid != irgm_source.uuid;
```

**14. Update form_element_id for non_applicable_form_element**

Below sql is used to re-map the form_element_id column from org1 values to new form_elements created for child Organisation.

```sql
-- Below Query should return empty list after the fix
set role calcutta_kids;
select f.name,c.name, c.id,count(*), min(fe.id)
from form f
         join form_element_group feg on f.id = feg.form_id
         join form_element fe on feg.id = fe.form_element_group_id
         join concept c on fe.concept_id = c.id
         left join non_applicable_form_element nafe on fe.id = nafe.form_element_id
where f.is_voided = false
  and feg.is_voided = false
  and fe.is_voided = false
  and (nafe is null or nafe.is_voided = true)
  and c.name != 'Placeholder for counselling form element'
group by f.name,c.id
having count(*) > 1;

-- Fix Query
reset role;
update non_applicable_form_element nafe_target
set form_element_id = fe_target.id
from non_applicable_form_element nafe_source
         join form_element fe_source on nafe_source.form_element_id = fe_source.id and fe_source.organisation_id = 1
         join form_element_group feg_source on feg_source.id = fe_source.form_element_group_id
         join form f_source on f_source.id = feg_source.form_id
         join form_element fe_target on fe_target.name = fe_source.name and fe_target.organisation_id = 19
         join form_element_group feg_target on feg_target.id = fe_target.form_element_group_id and feg_source.name = feg_target.name and feg_target.organisation_id = 19
         join form f_target on f_target.id = feg_target.form_id and f_source.name = f_target.name and f_target.organisation_id = 19

where nafe_source.organisation_id = 19
  and fe_source.uuid = fe_target.uuid
  and nafe_source.id = nafe_target.id
;
--COMMIT TRANSACTION

-- Below Query should return empty list after the fix
set role calcutta_kids;
select f.name,c.name, c.id,count(*), min(fe.id)
from form f
         join form_element_group feg on f.id = feg.form_id
         join form_element fe on feg.id = fe.form_element_group_id
         join concept c on fe.concept_id = c.id
         left join non_applicable_form_element nafe on fe.id = nafe.form_element_id
where f.is_voided = false
  and feg.is_voided = false
  and fe.is_voided = false
  and (nafe is null or nafe.is_voided = true)
  and c.name != 'Placeholder for counselling form element'
group by f.name,c.id
having count(*) > 1;
reset role;

```

**15. Delete forms and related entities corresponding to Org1 Vaccincation_checklist_form,as we only use Calcutta_kids version**
```sql
-- where form_id in (59, 8549);
-- No dependencies of checklist form on form_mapping or rule_failure_log, checklist_item_detail, decision_concept tables

delete from form_element fe
         using form_element_group feg
where fe.form_element_group_id = feg.id
  and fe.organisation_id = 19
 and feg.form_id in (select id from form where uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826' and organisation_id = 19);

delete from form_element_group feg
    using form f
where feg.form_id = f.id
  and feg.organisation_id = 19
  and f.uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826'
  and f.organisation_id = 19;

delete from form_mapping fm
    using form f
where fm.form_id = f.id
  and fm.organisation_id = 19
  and f.uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826'
  and f.organisation_id = 19;

delete from rule_failure_log rfl
    using form f
where rfl.form_id = f.id::text
  and rfl.organisation_id = 19
  and f.uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826'
  and f.organisation_id = 19;

delete from checklist_item_detail cid
    using form f
where cid.form_id = f.id
  and cid.organisation_id = 19
  and f.uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826'
  and f.organisation_id = 19;

delete from decision_concept dc
    using form f
where dc.form_id = f.id
  and f.uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826'
  and f.organisation_id = 19;

delete from form where uuid = '1579166d-b7ec-49ca-a60f-08f68ee27826' and organisation_id = 19;

```
    
#### Step 4: Update transactional data's type_ids

**1. Update subject_type of Individual**

```sql
select subject_type_id, count(*)
from public.individual
group by 1;

update public.individual
set manual_update_history   = append_manual_update_history(manual_update_history,
                                                           'avni-server#655 - Remove Calcutta Kids dependency on its parent'),
    subject_type_id         =
        (select id
         from subject_type
         where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3'
           and organisation_id = 19)
where subject_type_id = 1
  and organisation_id = 19;

```

**2. Update encounter_type of General encounters**
No action for Calcutta_kids

```sql
select e_source.encounter_type_id, org1et.organisation_id, newet.id, count(*)
from public.encounter e_source
         join encounter_type org1et on e_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where org1et.organisation_id = 1
  and e_source.organisation_id = 19
group by 1, 2, 3;
```

**3. Update Program for Program enrolment**

```sql

select prog_source.program_id, org1Prog.organisation_id, newprog.id, count(*)
from public.program_enrolment prog_source
         join program org1Prog on prog_source.program_id = org1Prog.id
         join program newprog on org1Prog.uuid = newprog.uuid and newprog.organisation_id = 19
where org1Prog.organisation_id = 1
  and prog_source.organisation_id = 19
group by 1, 2, 3;

update public.program_enrolment p_target
set manual_update_history   = append_manual_update_history(p_target.manual_update_history,
                                                           'avni-server#655 - Remove Calcutta Kids dependency on its parent'),
    program_id              = newprog.id
from public.program_enrolment p_source
         join program org1prog on p_source.program_id = org1prog.id
         join program newprog on org1prog.uuid = newprog.uuid and newprog.organisation_id = 19
where org1prog.organisation_id = 1
  and p_source.organisation_id = 19
  and p_target.organisation_id = 19
  and p_target.id = p_source.id;

```

**4. Update encounter_type for Program Encounter**

```sql
select e_source.encounter_type_id, org1et.organisation_id, newet.id, count(*)
from public.program_encounter e_source
         join encounter_type org1et on e_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where org1et.organisation_id = 1
  and e_source.organisation_id = 19
group by 1, 2, 3;


update public.program_encounter e_target
set manual_update_history   = append_manual_update_history(e_target.manual_update_history,
                                                           'avni-server#655 - Remove Calcutta Kids dependency on its parent'),
    encounter_type_id       = newet.id
from public.program_encounter e_source
         join encounter_type org1et on e_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where org1et.organisation_id = 1
  and e_source.organisation_id = 19
  and e_target.organisation_id = 19
  and e_target.id = e_source.id;

```

**5. Update genders for Individuals**

```sql
update public.individual ind_target
set manual_update_history   = append_manual_update_history(ind_target.manual_update_history,
                                                           'avni-server#655 - Remove Calcutta Kids dependency on its parent'),
    gender_id               = newgen.id
from public.individual as inf_source
         join gender org1gen on inf_source.gender_id = org1gen.id
         join gender newgen on org1gen.name = newgen.name and newgen.organisation_id = 19
where ind_target.id = inf_source.id
  and inf_source.organisation_id = 19
  and inf_source.gender_id != newgen.id;
```

**6. To update the `subject_migration` Table:**

```sql
update subject_migration
set manual_update_history   = append_manual_update_history(manual_update_history,
                                                           'avni-server#655 - Remove Calcutta Kids dependency on its parent'),
    subject_type_id         = (select id
                               from subject_type
                               where organisation_id = 19
                                 and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where subject_type_id = 1
  and organisation_id = 19;
```

**7. To update the `subject_program_eligibility` Table:**
Ignoring! since there were no records associated with organization_id 1 or 19

```sql
update subject_program_eligibility spe_target
set program_id              = newprog.id
from subject_program_eligibility spe_source
         join program org1prog on spe_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where spe_target.id = spe_source.id
  and spe_target.organisation_id = 19
  and spe_target.program_id != newprog.id;
```

#### Step 5: Post migration clean up tasks

**1. Reapply explicit userGroup privileges for Everyone group**

```sql
UPDATE public.groups
SET last_modified_date_time = now(),
    is_voided               = false::boolean
WHERE id = 796::integer;

update group_privilege
set last_modified_date_time = now(),
    is_voided               = false
where id in
      (<ids_list>);
```
**2. (Optional) Delete invalid userGroup privileges that are mapped to entities outside target organisation**

```sql

select gp.is_voided, gp.program_id, p.organisation_id, count(*)
from group_privilege gp
         join program p on gp.program_id = p.id
where gp.organisation_id = 19
group by 1, 2, 3;

select gp.is_voided, gp.program_encounter_type_id, p.organisation_id, count(*)
from group_privilege gp
         join encounter_type p on gp.program_encounter_type_id = p.id
where gp.organisation_id = 19
group by 1, 2, 3;

select gp.is_voided, gp.encounter_type_id, p.organisation_id, count(*)
from group_privilege gp
         join encounter_type p on gp.encounter_type_id = p.id
where gp.organisation_id = 19
group by 1, 2, 3;

-- Delete group_privileges mapped to org 10 Ashwini from org19
delete
from public.group_privilege
where encounter_type_id  in (<encounter_type_ids>)
  and organisation_id = 19;

delete
from public.group_privilege
where program_encounter_type_id  in (<program_encounter_type_ids>)
  and organisation_id = 19;
```

------------------------------
By following the above steps and recommendations, the dependency of Calcutta Kids organization's implementation on Org 1
was successfully removed without causing any issues.

## Post Migration steps
1. Ensure Avni-server is working fine
2. Ensure webapp and media are working fine
3. Change app.avniproject.org and server.avniproject.org to apps.avniproject.org and servers.avniproject.org
4. Start Avni-integration-server
5. Start Avni-etl server
6. Trigger Prod RDS Snapshot for post migration