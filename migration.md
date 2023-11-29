## **Removing Dependency from Org1 for Calcutta Kids Implementation**

### Objective:

The primary objective of this documentation is to remove the dependency of the Calcutta Kids organization's
implementation from Org1.

** IMPORTANT NOTE: 
We have to have confirmation from the Organisation that all users will be logging out and then doing a clean fresh sync from the scratch after the migration. This is required as we are not going to update the last_modified_date_time in the migration update commands. This would retain historical timestamp information.
If not, we need to update last_modified_date_time migration update command, to force sync the modified entries for already logged-in users.
**

### Steps Taken:

#### Step 1: Database Backup and Storage rest

    1. Create a manual backup of prod db just before starting the migration steps
    2. Clear all contents within "calcutta_kids/" folder of prod-user-media s3 folder

#### Step 2: Upload Org1 Metadata.zip file into Org2

- **Task**:
    1. Fix users to avoid login issues
        1. To set superadmin organization_id to null
           ```UPDATE users SET organisation_id = null::integer WHERE id = 64::integer```
        2. Create accountAdmin entry
           ```INSERT INTO public.account_admin (id, name, account_id, admin_id) VALUES (DEFAULT, 'superadmin'::varchar(255), 1::integer, 64::integer)```
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
  set role calcutta_kids;
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
       2. Login as superadmin and download bundle
       3. delete orgConfig entry for org1
```sql
 DELETE FROM public.organisation_config WHERE id = 436
```
    5. **Logout** and Login to app as org2 admin user, navigate to bundle upload screen
    6. Update and Set parent_orgnization_id as null
```sql
    update public.organisation set parent_organisation_id = null where id = 19;
```
    7. upload Metadata.zip file, ensure there are no failures other than those mentioned below. Access S3 to view the error csv file.
        - Ignore the following failures:
            - AddressLevelTypes.json : All types are voided and org uses its own defined AddressLevelTypes
    8. Ensure that the organisation_config is not overwritten, if yes, correct it
  ```sql
  UPDATE public.organisation_config
  SET last_modified_date_time = now(), uuid = '012771cf-910e-45c5-9a33-26a83a72e032', settings = '{"languages": ["en", "hi_IN"], "searchFilters": [{"type": "Name", "titleKey": "Name", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Age", "titleKey": "Age", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}, {"type": "SearchAll", "titleKey": "SearchAll", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}], "myDashboardFilters": [{"type": "Address", "titleKey": "Address", "subjectTypeUUID": "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3"}]}', last_modified_date_time = now()
  WHERE id = 8;
  ```

#### Step 3: Metadata Entities that are to be updated:

**1. To update the `form_mapping` Table:**

```sql
update form_mapping
set subject_type_id         = (select id
                               from subject_type
                               where organisation_id = 19
                                 and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where organisation_id = 19
  and is_voided = false
  and subject_type_id = 1;
```

**2. To update the `group_privilege` table's `subject_type_id` column:**

```sql
update group_privilege
set subject_type_id         = case
                                  when subject_type_id = 1 then (select id
                                                                 from subject_type
                                                                 where organisation_id = 19
                                                                   and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
                                  else subject_type_id end
where organisation_id = 19
  and subject_type_id = 1
  and is_voided = false;
```

**3. To update the `operational_subject_type` Table:**

```sql
update operational_subject_type
set subject_type_id         = (select id
                               from subject_type
                               where organisation_id = 19
                                 and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where subject_type_id = 1
  and organisation_id = 19;
```

**4. To update the `subject_migration` Table:**

```sql
update subject_migration
set subject_type_id         = (select id
                               from subject_type
                               where organisation_id = 19
                                 and subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where subject_type_id = 1
  and organisation_id = 19;
```

**5. To update the `operational_program` Table:**

```sql
update operational_program op_target
set program_id              = newprog.id
from operational_program op_source
         join program org1prog on op_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where op_source.program_id in (1, 2, 3)
  and op_target.uuid = op_source.uuid
  and op_target.organisation_id = 19
  and op_target.program_id != newprog.id;
```

**6. To update the `program_organisation_config` Table:**

```sql
update program_organisation_config poc_target
set program_id              = newprog.id
from program_organisation_config poc_source
         join program org1prog on poc_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where poc_source.uuid in (select uuid
                          from program_organisation_config
                          where program_organisation_config.organisation_id = 19)
  and poc_target.uuid = poc_source.uuid
  and poc_target.organisation_id = 19;
```

**7. To update the `subject_program_eligibility` Table:**
Ignoring! since there were no records associated with organization_id 1

**8. To update the `group_privilege` Table:**
Migration was not required for `encounter_type_id` as the records were already updated with organization 19, but it was
necessary for `subject_type_id` and `program_encounter_type_id`.

```sql

UPDATE group_privilege
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

**9. To update the `operational_encounter_type` Table:**

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

**10. Update concept_id for checklist_item_detail**

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

**11. Update form_id for form_element_group**

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

**12. Fix data issue with overlapping display order of unused form_elements **
Fix data issue with overlapping display order of unused form_elements created in calcutta_kids org through webapp.
Issue occurs due to org id now being merged.

```sql
delete
from form_element
where id in (1422, 1423, 1424);
```

**13. Update form_element_group for form_element**

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

**14. Update form_mapping**

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
  and fm_target.uuid = fm_source.uuid
  and fm_target.organisation_id = 19
  and fm_target.observations_type_entity_id <> newet.id;
```

**15. Update concept_answer **

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

#### Step 4: Update transactional data's type_ids

**1. Update subject_type of Individual**

```sql
select subject_type_id, count(*)
from public.individual
group by 1;

update public.individual
set subject_type_id         =
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
set program_id              = newprog.id
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
set encounter_type_id       = newet.id
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
set gender_id               = newgen.id
from public.individual as inf_source
         join gender org1gen on inf_source.gender_id = org1gen.id
         join gender newgen on org1gen.name = newgen.name and newgen.organisation_id = 19
where ind_target.id = inf_source.id
  and inf_source.organisation_id = 19
  and inf_source.gender_id != newgen.id;
```

**6. Update relationship_type_id for individual_relationship**

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

**7. Reapply explicit userGroup privileges for Everyone group**

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

-- Delete group_privileges mapped to org 10 Ashwini from org19
delete from public.group_privilege where encounter_type_id > 400 and encounter_type_id < 418 and organisation_id = 19;

delete from public.group_privilege where program_encounter_type_id > 400 and program_encounter_type_id < 418 and organisation_id = 19;


```

By following the above steps and recommendations, the dependency of Calcutta Kids organization's implementation on Org 1
was successfully removed without causing any issues.

With the previous steps completed, the remaining task is to write and implement the skip logic and rules specific to the
Calcutta Kids organization's implementation.

Once the skip logic and rules are written and tested, the Calcutta Kids organization's database and application setup
will be entirely independent of Org 1 and fully customized to their specific operational needs.
