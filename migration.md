## **Removing Dependency from Org 1 for Calcutta Kids Implementation**

### Objective:
The primary objective of this documentation is to remove the dependency of the Calcutta Kids organization's implementation from Org 1.

### Steps Taken:

#### Step 1: Database Restoration

- **Task**: 
  1. Downloaded the latest dump from the pre-release DB bundle and restored it to the local database. Given the file's size (32GB), this step was time-consuming.
  ```diff
  # The size of the database dump poses challenges, especially when frequent restorations are required. An alternative approach should be considered!
  ```
  3. Once the dump was downloaded, it was restored to the local database to be used as the primary database for server, webapp, and client applications.


#### Step 2: Identifying Core Entities Dependent on Org 1

- **Task**: 
  1. Firstly, identified all core entities that are related to Org 1 and determined which ones need to be migrated to Org 2 (Calcutta Kids org) and which ones are no longer required.   The following is the query used to identify tables containing the `organisation_id` column, which indicates potential organization level separation concerns.
  ```sql
  SELECT DISTINCT columns.table_name
  FROM information_schema.columns columns
  JOIN information_schema.tables tables ON columns.table_name = tables.table_name
  WHERE column_name = 'organisation_id'
  AND tables.table_schema = 'public' AND columns.table_schema = 'public'
  AND table_type = 'BASE TABLE';
  ```
  2. Manually checked which entities belong to Org 2 (CK org) and which belong to Org 1 and then a SQL update query was written to change the `organisation_id` from Org 1 to Org 2.

The following spreadsheet is used to track and manage the changes:
https://docs.google.com/spreadsheets/d/1flz3J_fWqbvFw3RnX0S4Mtsh-qfZtJRcJbY3KJsKbiY/edit?usp=sharing


####  3: Migration of base tables that use `organisation_id` column:
On doing so the previous step, the following is a list of entities that require update queries to be written and executed:

- `concept`
- `concept_answer`
- `encounter_type`
- `form_element`
- `form_element_group`
- `form_mapping`
- `gender`
- `individual_relation`
- `individual_relation_gender_mapping`
- `individual_relationship_type`
- `program`
- `program_organisation_config`
- `subject_type`
- `form`

**1.  Concept:** As there were so many concepts, reviewing each one to determine their relevance for the Calcutta Kids implementation was quite challenging and time-consuming. Since there's no issues in retaining unused concepts, all concepts in the `public.concepts` table from Org 1 were updated.
```sql
insert into concept (data_type, high_absolute, high_normal, low_absolute, low_normal, name, uuid, version, unit,
                     organisation_id, is_voided, audit_id, key_values, active, created_by_id, last_modified_by_id,
                     created_date_time, last_modified_date_time)
select data_type,
       high_absolute,
       high_normal,
       low_absolute,
       low_normal,
       name,
       uuid,
       version,
       unit,
       19,
       is_voided,
       audit_id,
       key_values,
       active,
       1,
       1,
       now(),
       now()
from concept
where uuid in (select uuid
               from concept
               where organisation_id = 1)
  and organisation_id = 1;
```

**2.  concept_answer:** 
```sql
insert into concept_answer (concept_id, answer_concept_id, uuid, version, answer_order, organisation_id, abnormal,
                            is_voided, uniq, audit_id, created_by_id, last_modified_by_id, created_date_time,
                            last_modified_date_time)
select concept_id,
       answer_concept_id,
       uuid,
       version,
       answer_order,
       19,
       abnormal,
       is_voided,
       uniq,
       audit_id,
       1,
       1,
       now(),
       now()
from concept_answer
where uuid in (select uuid
               from concept_answer
               where organisation_id = 1)
  and organisation_id = 1;

update concept_answer ca_target
set concept_id = newconcept.id
from concept_answer ca_source
         join concept org1concept on ca_source.concept_id = org1concept.id
         join concept newconcept on org1concept.name = newconcept.name and newconcept.organisation_id = 19
where ca_source.uuid in (select uuid
                         from concept_answer
                         where organisation_id = 1)
  and ca_source.organisation_id = 1
  and ca_target.uuid = ca_source.uuid
  and ca_target.organisation_id = 19;
```

**3.  subject_type:** 
```sql
insert into subject_type (uuid, name, organisation_id, is_voided, audit_id, version, is_group, is_household, active,
                          type, subject_summary_rule, allow_empty_location, unique_name, valid_first_name_regex,
                          valid_first_name_description_key, valid_last_name_regex, valid_last_name_description_key,
                          icon_file_s3_key, created_by_id, last_modified_by_id, created_date_time,
                          last_modified_date_time, directly_assignable, should_sync_by_location,
                          sync_registration_concept_1, sync_registration_concept_2, sync_registration_concept_1_usable,
                          sync_registration_concept_2_usable, name_help_text, allow_profile_picture,
                          valid_middle_name_regex, valid_middle_name_description_key, allow_middle_name,
                          program_eligibility_check_rule, program_eligibility_check_declarative_rule,
                          last_name_optional)
select uuid,
       name,
       19,
       is_voided,
       audit_id,
       version,
       is_group,
       is_household,
       active,
       type,
       subject_summary_rule,
       allow_empty_location,
       unique_name,
       valid_first_name_regex,
       valid_first_name_description_key,
       valid_last_name_regex,
       valid_last_name_description_key,
       icon_file_s3_key,
       1,
       1,
       now(),
       now(),
       directly_assignable,
       should_sync_by_location,
       sync_registration_concept_1,
       sync_registration_concept_2,
       sync_registration_concept_1_usable,
       sync_registration_concept_2_usable,
       name_help_text,
       allow_profile_picture,
       valid_middle_name_regex,
       valid_middle_name_description_key,
       allow_middle_name,
       program_eligibility_check_rule,
       program_eligibility_check_declarative_rule,
       last_name_optional
from subject_type
where uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3' and organisation_id = 1;
```

**4.  program:** 
```sql
insert into program (uuid, name, version, colour, organisation_id, audit_id, is_voided, enrolment_summary_rule,
                     enrolment_eligibility_check_rule, active, created_by_id, last_modified_by_id, created_date_time,
                     last_modified_date_time, enrolment_eligibility_check_declarative_rule,
                     manual_eligibility_check_required, manual_enrolment_eligibility_check_rule,
                     manual_enrolment_eligibility_check_declarative_rule, allow_multiple_enrolments)
select uuid,
       name,
       version,
       colour,
       19,
       audit_id,
       is_voided,
       enrolment_summary_rule,
       enrolment_eligibility_check_rule,
       active,
       1,
       1,
       now(),
       now(),
       enrolment_eligibility_check_declarative_rule,
       manual_eligibility_check_required,
       manual_enrolment_eligibility_check_rule,
       manual_enrolment_eligibility_check_declarative_rule,
       allow_multiple_enrolments
from program
where uuid in (
               '076ddb2d-a499-4314-af95-4178553d279b',
               '352d906c-b386-496c-ba23-91b1468a5613'
    )
  and organisation_id = 1;
```

**5.  encounter_type:** 
```sql
insert into encounter_type (name, concept_id, uuid, version, organisation_id, audit_id, is_voided,
                            encounter_eligibility_check_rule, active, created_by_id, last_modified_by_id,
                            created_date_time, last_modified_date_time, encounter_eligibility_check_declarative_rule,
                            is_immutable)
select name,
       concept_id,
       uuid,
       version,
       19,
       audit_id,
       is_voided,
       encounter_eligibility_check_rule,
       active,
       1,
       1,
       now(),
       now(),
       encounter_eligibility_check_declarative_rule,
       is_immutable
from encounter_type
where uuid in (
               '63486b57-67b9-4236-b36c-e7bbe5ac0411',
               '7b6a93c7-e1e1-4e73-842d-df8a1935bde2',
               '1dec6355-4abd-45b7-89ab-bae1f5f9cc07',
               'e9971396-b74f-411c-956d-da44073922f5',
               '330d954c-ab5f-4ea1-be8b-ba26a12bdfbc',
               '1f07ae8c-faa4-4934-8e06-9038e62fc2ac',
               '02c72b2b-19f0-4f75-b734-dcad5601881b'
    )
  and organisation_id = 1;
```

**6.  gender:** 
```sql
insert into gender (uuid, name, concept_id, version, audit_id, is_voided, organisation_id, created_by_id,
                    last_modified_by_id, created_date_time, last_modified_date_time)
select uuid,
       name,
       concept_id,
       version,
       audit_id,
       is_voided,
       19,
       1,
       1,
       now(),
       now()
from gender
where uuid in (
               'ad7d1d14-54fd-45a2-86b7-ea329b744484',
               '840de9fb-e565-4d7d-b751-90335ba20490',
               '188ad77e-fe46-4328-b0e2-98f3a05c554c'
    )
  and organisation_id = 1;
```

**7.  individual_relation:** 
```sql
insert into individual_relation (uuid, name, is_voided, organisation_id, version, audit_id, created_by_id,
                                 last_modified_by_id, created_date_time, last_modified_date_time)
select uuid,
       name,
       is_voided,
       19,
       version,
       audit_id,
       1,
       1,
       now(),
       now()
from individual_relation
where uuid in (select uuid
               from individual_relation
               where organisation_id = 1)
  and organisation_id = 1;
```

**8.  individual_relation_gender_mapping:** 
```sql
insert into individual_relation_gender_mapping (uuid, relation_id, gender_id, is_voided, organisation_id, version,
                                                audit_id, created_by_id, last_modified_by_id, created_date_time,
                                                last_modified_date_time)
select uuid,
       relation_id,
       gender_id,
       is_voided,
       19,
       version,
       audit_id,
       1,
       1,
       now(),
       now()
from individual_relation_gender_mapping
where uuid in (select uuid
               from individual_relation_gender_mapping
               where organisation_id = 1)
  and organisation_id = 1;

update individual_relation_gender_mapping irgm_target
set relation_id = newir.id,
    gender_id   = newgender.id
from individual_relation_gender_mapping irgm_source
         join individual_relation org1ir on irgm_source.relation_id = org1ir.id
         join individual_relation newir on org1ir.name = newir.name and newir.organisation_id = 19
         join gender org1gender on irgm_source.gender_id = org1gender.id
         join gender newgender on org1gender.name = newgender.name and newgender.organisation_id = 19
where irgm_source.uuid in (select uuid
                           from individual_relation_gender_mapping
                           where organisation_id = 1)
  and irgm_source.organisation_id = 1
  and irgm_target.uuid = irgm_source.uuid
  and irgm_target.organisation_id = 19;
```

**9.  individual_relationship_type:** 
```sql
insert into individual_relationship_type (uuid, name, individual_a_is_to_b_relation_id,
                                          individual_b_is_to_a_relation_id, is_voided, organisation_id, version,
                                          audit_id, created_by_id, last_modified_by_id, created_date_time,
                                          last_modified_date_time)
select uuid,
       name,
       individual_a_is_to_b_relation_id,
       individual_b_is_to_a_relation_id,
       is_voided,
       19,
       version,
       audit_id,
       1,
       1,
       now(),
       now()
from individual_relationship_type
where uuid in (select uuid
               from individual_relationship_type
               where organisation_id = 1)
  and organisation_id = 1;

update individual_relationship_type irt_target
set individual_a_is_to_b_relation_id = newiratob.id,
    individual_b_is_to_a_relation_id = newirbtoa.id
from individual_relationship_type irt_source
         join individual_relation org1iratob on irt_source.individual_a_is_to_b_relation_id = org1iratob.id
         join individual_relation newiratob on org1iratob.name = newiratob.name and newiratob.organisation_id = 19
         join individual_relation org1irbtoa on irt_source.individual_b_is_to_a_relation_id = org1irbtoa.id
         join individual_relation newirbtoa on org1irbtoa.name = newirbtoa.name and newirbtoa.organisation_id = 19
where irt_source.uuid in (select uuid
                           from individual_relationship_type
                           where organisation_id = 1)
  and irt_source.organisation_id = 1
  and irt_target.uuid = irt_source.uuid
  and irt_target.organisation_id = 19
  and (
        irt_target.individual_a_is_to_b_relation_id != newiratob.id
       OR irt_target.individual_b_is_to_a_relation_id != newirbtoa.id
    );
```

**10.  form:** 
```sql
insert into form (name, form_type, uuid, version, organisation_id, audit_id, is_voided, decision_rule,
                  validation_rule, visit_schedule_rule, checklists_rule, created_by_id, last_modified_by_id,
                  created_date_time, last_modified_date_time, validation_declarative_rule, decision_declarative_rule,
                  visit_schedule_declarative_rule, task_schedule_declarative_rule, task_schedule_rule)
select name,
       form_type,
       uuid,
       version,
       19,
       audit_id,
       is_voided,
       decision_rule,
       validation_rule,
       visit_schedule_rule,
       checklists_rule,
       1,
       1,
       now(),
       now(),
       validation_declarative_rule,
       decision_declarative_rule,
       visit_schedule_declarative_rule,
       task_schedule_declarative_rule,
       task_schedule_rule
from form
where uuid in (
               'aac5c57a-aa01-49bb-ad20-70536dd2907f',
               '026e2f5c-8670-4e4b-9a54-cb03bbf3093d',
               '3a95e9b0-731a-4714-ae7c-10e1d03cebfe',
               '9ed7e0a9-6122-41ee-8413-1cef6792e2c6',
               'cc6a3c6a-c3cc-488d-a46c-d9d538fcc9c2',
               '32428a7e-d553-4172-b697-e8df3bbfb61d',
               '78b1400e-8100-4ba6-b78e-fef580f7fb77',
               'e57e2f11-6684-456a-bd00-6511d9b06eaa',
               '901e2f48-2fb8-402b-9073-ee2fac33fce4',
               '1608c2c0-0334-41a6-aab0-5c61ea1eb069',
               'e09dddeb-ed72-40c4-ae8d-112d8893f18b',
               '67165f46-890d-4747-ba9a-dbaa0cfa5353',
               'd062907a-690c-44ca-b699-f8b2f688b075'
    )
  and organisation_id = 1;
```

**11.  form_mapping:** 
```sql
insert into form_mapping (form_id, uuid, version, entity_id, observations_type_entity_id, organisation_id, audit_id,
                          is_voided, subject_type_id, enable_approval, created_by_id, last_modified_by_id,
                          created_date_time, last_modified_date_time, task_type_id, impl_version)
select form_id,
       uuid,
       version,
       entity_id,
       observations_type_entity_id,
       19,
       audit_id,
       is_voided,
       subject_type_id,
       enable_approval,
       1,
       1,
       now(),
       now(),
       task_type_id,
       impl_version
from form_mapping
where uuid in ('23a1f57f-1dca-46d0-b44f-c729789cd84c',
               'ee26b976-72e3-45f4-9391-9eb0d6ce394d',
               '3ca80fcf-2aa0-4b62-92d5-99fad005c7d9',
               '310fb206-d2a8-4bba-af39-932a3dedec2c',
               '22edd4a1-a5f5-455a-97e7-6089e4f0e5e2',
               '2bfec23f-6477-49a0-9210-0894aaee3eb2',
               '94aad61f-6088-4361-b18a-c693db9df145',
               'fbb00f7a-dd59-4dae-8ba6-c55dc709d300',
               'f030a553-f5f0-4972-a63d-9caad4b1bdfd',
               '70178ca5-959d-4c32-8e99-56d66f2fff4a',
               'e21b4b33-c37a-4c82-8f77-4f6c496fae87',
               'a881addf-fdc7-4b6a-ad79-225396594ecd')
  and organisation_id = 1;


update form_mapping fm_target
set form_id         = newform.id,
    subject_type_id = (select id from subject_type where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
from form_mapping as fm_source
         join form org1form on fm_source.form_id = org1form.id
         join form newform on org1form.name = newform.name and newform.organisation_id = 19
where fm_source.uuid in ('23a1f57f-1dca-46d0-b44f-c729789cd84c',
                         'ee26b976-72e3-45f4-9391-9eb0d6ce394d',
                         '3ca80fcf-2aa0-4b62-92d5-99fad005c7d9',
                         '310fb206-d2a8-4bba-af39-932a3dedec2c',
                         '22edd4a1-a5f5-455a-97e7-6089e4f0e5e2',
                         '2bfec23f-6477-49a0-9210-0894aaee3eb2',
                         '94aad61f-6088-4361-b18a-c693db9df145',
                         'fbb00f7a-dd59-4dae-8ba6-c55dc709d300',
                         'f030a553-f5f0-4972-a63d-9caad4b1bdfd',
                         '70178ca5-959d-4c32-8e99-56d66f2fff4a',
                         'e21b4b33-c37a-4c82-8f77-4f6c496fae87',
                         'a881addf-fdc7-4b6a-ad79-225396594ecd')
  and fm_target.uuid = fm_source.uuid
  and fm_source.organisation_id = 1
  and fm_target.organisation_id = 19
  and fm_target.form_id         <> newform.id;
```

**12.  form_element_group:** 
```sql
insert into form_element_group (name, form_id, uuid, version, display_order, display, organisation_id, audit_id,
                                is_voided, rule, created_by_id, last_modified_by_id, created_date_time,
                                last_modified_date_time, declarative_rule, start_time, stay_time, is_timed, text_colour,
                                background_colour)
select name,
       form_id,
       uuid,
       version,
       display_order,
       display,
       19,
       audit_id,
       is_voided,
       rule,
       1,
       1,
       now(),
       now(),
       declarative_rule,
       start_time,
       stay_time,
       is_timed,
       text_colour,
       background_colour
from form_element_group
where uuid in (
               '32fb721e-a825-4f94-97af-27894bd39720',
               '2dff8c09-bed3-4848-943f-b2240b70d7ed',
               '71b33c6d-e029-43be-baff-452c3e31890d',
               '50a2d045-88fe-44e3-86e0-0dba16f53818',
               'fa3eaeb3-115f-4634-a6e7-e51b3e6d4e44',
               'a9edaaef-c93b-4039-8fab-ef8b836cf19a',
               'e2737f19-7f9a-4d12-bf02-c676091a09be',
               '139162e9-1da5-4a8d-a8b3-3ed870de110b',
               '36debb83-db66-4da1-88c7-23c0dfc47649',
               '1ca46e2e-36bc-415b-ba50-9021588e676a',
               'cb8b6812-b58b-428d-afbd-7f53748c684d',
               '07458686-88c5-448f-92ed-c150c0629b4f',
               '33b4dfd6-2b49-4230-8132-46bd2232c2db',
               '353eec4f-052f-466b-9acb-7a740e5c19e5',
               'f9301aef-48af-4ee7-8435-e66c1e23fd21',
               '55dcd6c1-a406-4006-9d08-0c71c624d1c4',
               '70025486-e617-423c-98e7-016c5e9c59f5',
               '40f81e13-bcd8-4190-9651-f04f504b9f09',
               'fff4c8e6-7adb-4caa-a79a-3e7d77a42111',
               '5b4f6a0d-0f66-4f03-bb06-ea237ddc3af4',
               'a7b3d24c-1e7f-4b0e-83eb-b81469bc5a48',
               '586b9fc7-7db9-42b5-9e89-ee1f05ac9de8',
               'fa392acd-d9bf-4b90-b520-bc28d61300b8',
               'b4c1288e-23d6-4612-a4da-7ad6047a9f83',
               'db1d4fbd-f885-4e56-9c25-1bf4dc4e2805',
               '9b937fd3-3a23-40c7-bb11-fa2bfd9ce906',
               'bd0672b5-bc94-45c3-a24e-210a7c7b0d93',
               '1299dc47-a804-4176-9dd6-fa65a177bfa5',
               'f00ea0bc-ca88-4c15-85e1-e3b9a7d90946',
               '041d47a8-282c-4b7c-8f3b-d606268b450c',
               '5c26ca56-8155-433a-b5d5-35f7ae990ec2',
               '187479ba-7c41-4cd4-beac-9d0cf7735852',
               '330730f4-71c8-4e31-aa30-5cbf4d07d1e2',
               '5d1cff96-3a19-430d-92bf-0244a2562154',
               '92802ca9-1494-4c7a-a629-96362d0f4756',
               '062ffc31-c311-485b-baf3-d5a95d10e97c',
               '00595000-54fb-40f2-9493-a57f01881aad',
               'daea5603-e7c8-449f-85ad-da9be62c2288',
               'abde79ae-b9d5-484d-832e-be69d87824f4',
               '4c5093dd-feb3-4f94-b930-b7168bb65c71',
               '550cc969-4021-4d13-8ad3-d8759388205b',
               'd4db4667-2e87-4929-9de5-921d12196e25',
               'cddc82ff-89f7-494d-af37-d764d4d3d300',
               'eb7b004a-f570-495a-a0c3-6ecce0c4de3b',
               'e482f207-a243-47b1-98a1-3bb246ba5a48',
               '1b25d014-f4c3-48cd-ba6b-abb00c186329',
               '4cda489f-1891-4533-a8c3-30b936ea866f',
               '124d7b8b-0baf-4bdf-8f8a-5de8a4c95218',
               '0f2c45e2-d5fa-40cc-855d-18deedd4e459'
    )
  and organisation_id = 1;

update form_element_group fg_target
set form_id = newform.id
from form_element_group as fg_source
         join form "org1form" on fg_source.form_id = org1form.id
         join form newform on org1form.name = newform.name and newform.organisation_id = 19
where fg_source.uuid in (
                         '32fb721e-a825-4f94-97af-27894bd39720',
                         '2dff8c09-bed3-4848-943f-b2240b70d7ed',
                         '71b33c6d-e029-43be-baff-452c3e31890d',
                         '50a2d045-88fe-44e3-86e0-0dba16f53818',
                         'fa3eaeb3-115f-4634-a6e7-e51b3e6d4e44',
                         'a9edaaef-c93b-4039-8fab-ef8b836cf19a',
                         'e2737f19-7f9a-4d12-bf02-c676091a09be',
                         '139162e9-1da5-4a8d-a8b3-3ed870de110b',
                         '36debb83-db66-4da1-88c7-23c0dfc47649',
                         '1ca46e2e-36bc-415b-ba50-9021588e676a',
                         'cb8b6812-b58b-428d-afbd-7f53748c684d',
                         '07458686-88c5-448f-92ed-c150c0629b4f',
                         '33b4dfd6-2b49-4230-8132-46bd2232c2db',
                         '353eec4f-052f-466b-9acb-7a740e5c19e5',
                         'f9301aef-48af-4ee7-8435-e66c1e23fd21',
                         '55dcd6c1-a406-4006-9d08-0c71c624d1c4',
                         '70025486-e617-423c-98e7-016c5e9c59f5',
                         '40f81e13-bcd8-4190-9651-f04f504b9f09',
                         'fff4c8e6-7adb-4caa-a79a-3e7d77a42111',
                         '5b4f6a0d-0f66-4f03-bb06-ea237ddc3af4',
                         'a7b3d24c-1e7f-4b0e-83eb-b81469bc5a48',
                         '586b9fc7-7db9-42b5-9e89-ee1f05ac9de8',
                         'fa392acd-d9bf-4b90-b520-bc28d61300b8',
                         'b4c1288e-23d6-4612-a4da-7ad6047a9f83',
                         'db1d4fbd-f885-4e56-9c25-1bf4dc4e2805',
                         '9b937fd3-3a23-40c7-bb11-fa2bfd9ce906',
                         'bd0672b5-bc94-45c3-a24e-210a7c7b0d93',
                         '1299dc47-a804-4176-9dd6-fa65a177bfa5',
                         'f00ea0bc-ca88-4c15-85e1-e3b9a7d90946',
                         '041d47a8-282c-4b7c-8f3b-d606268b450c',
                         '5c26ca56-8155-433a-b5d5-35f7ae990ec2',
                         '187479ba-7c41-4cd4-beac-9d0cf7735852',
                         '330730f4-71c8-4e31-aa30-5cbf4d07d1e2',
                         '5d1cff96-3a19-430d-92bf-0244a2562154',
                         '92802ca9-1494-4c7a-a629-96362d0f4756',
                         '062ffc31-c311-485b-baf3-d5a95d10e97c',
                         '00595000-54fb-40f2-9493-a57f01881aad',
                         'daea5603-e7c8-449f-85ad-da9be62c2288',
                         'abde79ae-b9d5-484d-832e-be69d87824f4',
                         '4c5093dd-feb3-4f94-b930-b7168bb65c71',
                         '550cc969-4021-4d13-8ad3-d8759388205b',
                         'd4db4667-2e87-4929-9de5-921d12196e25',
                         'cddc82ff-89f7-494d-af37-d764d4d3d300',
                         'eb7b004a-f570-495a-a0c3-6ecce0c4de3b',
                         'e482f207-a243-47b1-98a1-3bb246ba5a48',
                         '1b25d014-f4c3-48cd-ba6b-abb00c186329',
                         '4cda489f-1891-4533-a8c3-30b936ea866f',
                         '124d7b8b-0baf-4bdf-8f8a-5de8a4c95218',
                         '0f2c45e2-d5fa-40cc-855d-18deedd4e459'
    )
  and fg_source.organisation_id = 1
  and fg_target.uuid = fg_source.uuid
  and fg_target.organisation_id = 19;
```

**13.  form_element:** 
```sql
insert into form_element (name, display_order, is_mandatory, key_values, concept_id, form_element_group_id, uuid,
                          version, organisation_id, type, valid_format_regex, valid_format_description_key, audit_id,
                          is_voided, rule, created_by_id, last_modified_by_id, created_date_time,
                          last_modified_date_time, declarative_rule, group_id, documentation_id)
select name,
       display_order,
       is_mandatory,
       key_values,
       concept_id,
       form_element_group_id,
       uuid,
       version,
       19,
       type,
       valid_format_regex,
       valid_format_description_key,
       audit_id,
       is_voided,
       rule,
       1,
       1,
       now(),
       now(),
       declarative_rule,
       group_id,
       documentation_id
from form_element
where uuid in (
               '1cbcd6a6-1ef1-410b-926e-754011d22a58',
               '1a04eae4-cb00-4cf9-ae7a-fd080ad637f9',
               '10a7bb47-6780-4b43-9ebd-842b1f5cc58f',
               '1e3afc0f-4f40-46f5-ab20-0739c30f99cd',
               'fef50f26-8251-4ba8-80dd-526eaade37f1',
               'a21ba591-9f62-44b4-addc-44df0eea168b',
               '8b7b54a0-6f07-40b4-b080-f2023ec2ee2f',
               '0abd0e1e-484c-48c9-ab3a-ffa14b66c9c5',
               'd07f9fdc-2dbe-4b21-abce-eb79c30470b8',
               '8e82a356-22a7-44ae-b28f-2b30fd6f9664',
               'ea8e0c8c-ca3f-46e7-b64b-2dedb0391c03',
               '4ae32d41-7c2e-4d7d-8ac6-566c9331f3a1',
               '955713c1-ea0e-439f-8d95-8fdef38a9a49',
               '1d8cd852-f03c-45f1-b09c-a6e601d5f0b0',
               '7eb50d2d-387c-47f2-b10b-b2cfd484eb2e',
               'be6fad57-fe7e-4bc0-bf36-26a31aec0d78',
               '06458e0b-9b1c-45a0-9d29-eac854953bd1',
               '3c38e7a2-f273-4a3c-a0c8-040e06401a87',
               'fe3a208c-41b4-45b4-82f0-39ad78b2b17a',
               '32bed768-4074-45c4-92a6-4bc27f43bbdc',
               'a9a50a04-6e62-4398-b0ed-1039f82fe323',
               '5682fc9d-a852-445d-9e8e-d67a1fa51266',
               'e4511f13-5b2a-4df2-9e7b-72729c1f6923',
               '6b5f0898-6ea3-4395-91e2-6e415cada5ff',
               '2440a24d-74ad-457a-813b-cce5dfedc136',
               'e7a89295-3b62-403d-9690-814488bc0a3d',
               'c30e4c6c-a823-47ff-8c8c-328f89a2587f',
               '89136929-82c4-4e5c-a32f-5d00ef1ea4a4',
               'bcda771b-c8e2-4931-aa8a-13c9d340718c',
               '972a7890-4fa9-42c8-b4b8-fe8583c5ae80',
               '099dd8f5-ed61-4195-ba8c-2a9f26317642',
               '86d906d2-f44f-4743-9044-f7b23df6d5d8',
               'c253083f-a2f9-4bec-a07f-8883637125db',
               '407b2857-e5cd-4805-9b2c-c43c2e819b04',
               '63987b56-7200-4a0d-9db5-4f01470da996',
               'bdab2e43-5e2c-43b9-bd1d-26707aa9806d',
               '44a88f6b-8b20-4a1b-835a-ad37193d7dc4',
               '456f4de6-c474-43a3-8417-08ec374a27b7',
               'f09992f0-ef48-4fb8-ad08-0f9a718aee54',
               'b21c3ad3-d3df-4e3b-997a-d184a26a377d',
               'c961c4c8-22e1-47fd-8e4d-bef66c962303',
               '97759fac-b25e-449b-b9da-2be2818a978c',
               '3a7a4451-dceb-439b-aab3-9e968bd5be1b',
               'a4194db7-7d4b-4deb-9b1e-4f42ab5ded94',
               'bbbaa09b-b314-4123-a578-2e4b3f8d0b97',
               'e6126713-09aa-4a04-8f60-414dbd4125e5',
               '691853b9-3634-440d-a4b5-12d0c2020125',
               '6bc5a76c-b45a-4489-b206-a21aca3e7fd3',
               '4fa32ede-c17d-4e0e-b8bc-2d5ced4b2dab',
               '6cf6bb59-08bb-4a78-9bfd-d82727f7e2b8',
               'b220398e-6f51-4568-978d-8e632cab00be',
               '2363acaa-e9d3-48df-8753-cac4c708a2fc',
               '8041f3fc-fc3e-4360-b732-105d9d599ee3',
               'af2b1579-175a-4ce9-9c40-d97912002be9',
               '2443614a-fe92-4667-9baa-51392342ec39',
               'a5b16727-5cf4-4a49-8732-03dddf6ed311',
               'db534cf4-aaaa-4e21-a096-da10d7cb32de',
               '21b2dc49-e6b3-4284-9201-a458c1207276',
               '86ef76cc-5d32-4b8d-baba-68036814bc56',
               'b5b344b2-963b-4ea5-9dec-9bf0569745f1',
               '29f76b3f-fb06-4712-acf9-d69af5e5324b',
               '6add2fc3-e393-40d6-bc32-6b5c9abf5622',
               '958d637a-6937-4b38-b070-09cfbc8a77ff',
               '3180d108-b1ef-4aae-ac29-fa2c59a223f2',
               '7e381832-1a9c-40cf-aac5-93d0c929a415',
               '81cf6b23-151a-4911-9e93-1b8fa8c6b2a6',
               'a346544d-58ff-42c2-98ac-5b4d78235039',
               'c1143a94-b5d5-4a61-819a-bf5ea8b8f13f',
               'e7330887-acd7-432c-91b4-e76d63882bcc',
               '00fc5551-2a08-4f3b-b50f-c30c75909a0f',
               'e5f3f12e-a842-4424-adf6-84f39ff79959',
               '6e039512-c2c5-48bb-af12-a93fe5d7e6d8',
               '64fab82b-ce76-433b-983f-79549ea0b954',
               '636c193e-a744-4e78-bab1-fb30266d0e20',
               '9fc60df9-496f-4116-abfd-03bf46e93269',
               '489839c0-f6be-43d6-b7a8-692c2ade9703',
               '3cb0a598-8d9d-4477-8dce-4665083f82df',
               '78637787-132d-4745-a98a-74b1ab578c95',
               '96671bb8-c450-47f6-9b08-ff07aea0af08',
               'ea055999-fcfb-4315-aa4a-a9e48934d59a',
               'af627631-0653-4281-94ff-64d0a8745c8c',
               '31f862bf-b034-4c79-973d-39ba26bdc1f7',
               '88d67af0-ab70-4fd9-a39c-2923502a0846',
               '47cfb5e3-9d90-4fe2-8eb0-6c4933a1d299',
               '2443a88b-95e5-47df-9a02-363e130013d0',
               'c317355a-180b-447f-b406-d6dbbeadc17f',
               '4ff66c5e-becb-4f0c-bb33-59f5546311f4',
               '77791c29-90ec-485a-9cef-298b9b575dd2',
               'f48b8eb2-a338-45fd-b63d-3c00d266d388',
               '205013a3-b967-4b42-ac0b-9ffe99fe88f9',
               'f9453d8c-2085-4435-840f-3ddcd79f788f',
               '598a7f46-b0e9-40b6-b4b4-1312e6238819',
               '51bc43a2-1ee7-4f37-a3b1-e81aec1135e0',
               '14ebb121-7602-4644-81b3-6e171cea19ab',
               '1e5583d4-24f0-4a45-b712-f753eb48c8f9',
               'd4d13b86-435f-4fe6-bb74-6a00cd41b174',
               'c4658141-4d39-44bf-8c16-dab5919431ef',
               'eeb437e8-6861-4f2c-a545-6d54c5c83dfa',
               '041c5758-d2aa-473c-b3f1-20fc529056cd',
               'abf596f7-aefd-4938-86b0-49e75fdf6511',
               '012590a5-15e9-445a-b75f-e41a9d0688cf',
               '1f54eacd-2004-4b9b-8f29-c67d94f74103',
               '3217fb80-e129-424a-891b-e1b32e10eead',
               '62c01607-c063-49cd-ac39-ea1541243c44',
               '68bfde5c-92b7-4188-b2a2-bb96abfc174e',
               'a427afb1-a183-4d92-88eb-2a40e4a00058',
               'f483e292-24b6-4d76-af72-8b13c9a5c596',
               'a60089b0-71d7-487d-9102-1e8b52789bf7',
               '19e880a8-b886-436c-885e-cc5ce11cb284',
               '5975a1d5-f43e-441e-a758-b2d4913dc543',
               '2765a380-21ca-4989-b14a-1d69eea9f8c4',
               '827f5d7c-e0fa-4725-91dd-a7a93149b1ad',
               'b7faa7e3-f518-4cf0-8bbc-c10bb49c0b4b',
               '491f80c6-1e45-4a6e-8233-42a1cde8b5d7',
               'd9b350f8-3ed0-4333-bd13-dccd363020bd',
               '3ae759ca-ba9e-43dd-8e64-270fdf0d1b38',
               '04627edc-a358-451a-9772-d98084e81a36',
               '23706cd0-0097-4665-b9b1-9b10647a87a4',
               '71bf6c25-c8a7-4479-8265-f0aa80b9b606',
               '55afee91-a15f-48a7-ab49-116b51a831cd',
               '71cd83d1-ca13-4be2-807b-5740bcc42ba8',
               '9355caa3-2050-4161-a218-cf6f7d06538f',
               'eda307c8-8f67-4182-be28-111e81db0c12',
               '27c08d47-f440-44ee-a6b8-6d673fbd7f20',
               '736a18f7-9ec1-4b13-896b-7d8f03d3d1b7',
               '8521fb49-fdc8-454b-b129-49efcd25c933',
               '4f3017e8-baf9-4b41-b1fb-02bac76b7bfa',
               'c1ede711-9b95-4866-bd9c-e9b4f551555e',
               '303d6411-e393-4b4a-b5a6-79c75a4d33e1',
               '6985bbf7-0f97-40a8-8c06-875e31631bc6',
               'c29973e2-baea-429d-9f4c-42f33fa8edd4',
               '4039039a-c395-4fd1-b7b2-379910df2494',
               'e7aedf63-6418-4a8f-8d99-a5d93ca41f89',
               'e4fbdffd-d9fe-4f31-a613-516385c7d325',
               'ceed29aa-0145-4c77-a032-2c1546682612',
               'e9097f25-cb68-44d5-8709-f7ccfa3d36d6',
               'c31449fa-9102-4a46-8264-022d529d4f38',
               '1f0bbcce-801e-4736-b5ab-c8afee6e8521',
               'd1c666b6-8433-4afa-b2f0-264828b2781a',
               '4849b8dd-cce8-4302-b77e-5bf28a555229',
               'd15703be-5c42-45ad-bebb-a5a438cf7fb4',
               'd6b5cb76-843b-48b7-a0f1-645caf9a178e',
               '1bb5e368-fca1-4b8b-8ff7-7b84285509ed',
               'f47bde61-d1c3-4910-9263-3f7ff982f989',
               'd0bc99af-af04-4a54-9bc5-a2783a783c1a',
               'def57525-ba02-4aea-a79a-ab2513f0a7eb',
               '67bb881d-808f-41ba-a336-27a57111ee1d',
               '0b652f14-8d13-49d7-94fd-8c39a72f4033',
               'e9361bd1-9e3b-41e4-b83b-576aa83bd08b',
               '2846e0d2-34c6-4a20-a43e-4c11c0e1f351',
               '6564bc9a-aef4-48cf-b517-69848358f3e0',
               'ac5162bd-191b-4ff1-8cd2-e4a1603981a7',
               'e5529a87-915c-4e75-9376-9bc1706cb9d8',
               '2d8c280d-8de5-4792-bf25-08ad5f1cd35a',
               'e643f8a3-b03a-4a03-8c26-19c6bcf8538f',
               '37e5335a-42bc-4a25-840a-e82e820f4f15',
               'a489a772-08f7-49c9-8bbc-814cfdcf1525',
               '84cc43d5-72ed-4f01-918e-86ecd7464079',
               '786fa276-8baa-4315-8f72-1da2e0c888a6',
               '94a659ce-dd98-44a1-a3ea-2a8abc622990',
               '81a8c965-37c8-4d64-8da1-bdac3f098032',
               'fd5cd4f8-0406-45ca-ae1d-ee285d94e281',
               'ee520d1f-8d64-4f73-9bec-4ae318f350cf',
               '670644a6-4acf-45ee-8bd5-811146ad5d28',
               '77f470aa-4a1a-4297-8f93-c43b2d93e649',
               '4f566336-c5cd-4353-9213-faa4411d5b2d',
               '443462ad-4de0-4d6f-bfbc-bc8c1404b131',
               '83e6cb7b-5f2d-4c5b-a9d1-0be071d6e956',
               'f6efd6e9-ea2d-4a8f-baeb-6fe12a86f7d8',
               'cc9ab419-4f09-4812-8292-151f008c6e32',
               '4f6e842e-8556-448b-9ebf-93ad06a333a5',
               '219bfbb0-03ff-4be4-a8c1-5eb98ab6fe6c',
               '9ef90251-e2b8-411b-845c-f980d2ca1427',
               'e6e54c47-290c-4c8b-a2b3-dd30c39a361f',
               'a2053871-6568-4969-8eac-8820fd67d928',
               'fcb4209d-f752-4898-aa7a-b9be066dfb0d',
               '0bc88846-bf92-4040-8bb9-a57f3efb9004',
               'da9822ab-4990-4333-982a-9e52d2b77260',
               'e0020b70-4f76-4b81-99f3-cfcf22d2c004',
               '1ca19a30-1b67-4dd3-9994-c2048813aeff',
               '0e656272-03c2-41a9-8935-60444909082f',
               '7770dcf2-c2c4-4161-b442-c779ab9725e2',
               '148d49f3-84ca-4d5d-b89b-7dd8b7d7a902',
               'f5a4cf17-0b36-41e4-a3b9-6019d67bc7ae'
    )
  and organisation_id = 1;


update form_element fe_target
set form_element_group_id = newfg.id
from form_element as fe_source
         join form_element_group org1fg on fe_source.form_element_group_id = org1fg.id
         join form_element_group newfg on org1fg.uuid = newfg.uuid and newfg.organisation_id = 19
where fe_source.uuid in (
                         '1cbcd6a6-1ef1-410b-926e-754011d22a58',
                         '1a04eae4-cb00-4cf9-ae7a-fd080ad637f9',
                         '10a7bb47-6780-4b43-9ebd-842b1f5cc58f',
                         '1e3afc0f-4f40-46f5-ab20-0739c30f99cd',
                         'fef50f26-8251-4ba8-80dd-526eaade37f1',
                         'a21ba591-9f62-44b4-addc-44df0eea168b',
                         '8b7b54a0-6f07-40b4-b080-f2023ec2ee2f',
                         '0abd0e1e-484c-48c9-ab3a-ffa14b66c9c5',
                         'd07f9fdc-2dbe-4b21-abce-eb79c30470b8',
                         '8e82a356-22a7-44ae-b28f-2b30fd6f9664',
                         'ea8e0c8c-ca3f-46e7-b64b-2dedb0391c03',
                         '4ae32d41-7c2e-4d7d-8ac6-566c9331f3a1',
                         '955713c1-ea0e-439f-8d95-8fdef38a9a49',
                         '1d8cd852-f03c-45f1-b09c-a6e601d5f0b0',
                         '7eb50d2d-387c-47f2-b10b-b2cfd484eb2e',
                         'be6fad57-fe7e-4bc0-bf36-26a31aec0d78',
                         '06458e0b-9b1c-45a0-9d29-eac854953bd1',
                         '3c38e7a2-f273-4a3c-a0c8-040e06401a87',
                         'fe3a208c-41b4-45b4-82f0-39ad78b2b17a',
                         '32bed768-4074-45c4-92a6-4bc27f43bbdc',
                         'a9a50a04-6e62-4398-b0ed-1039f82fe323',
                         '5682fc9d-a852-445d-9e8e-d67a1fa51266',
                         'e4511f13-5b2a-4df2-9e7b-72729c1f6923',
                         '6b5f0898-6ea3-4395-91e2-6e415cada5ff',
                         '2440a24d-74ad-457a-813b-cce5dfedc136',
                         'e7a89295-3b62-403d-9690-814488bc0a3d',
                         'c30e4c6c-a823-47ff-8c8c-328f89a2587f',
                         '89136929-82c4-4e5c-a32f-5d00ef1ea4a4',
                         'bcda771b-c8e2-4931-aa8a-13c9d340718c',
                         '972a7890-4fa9-42c8-b4b8-fe8583c5ae80',
                         '099dd8f5-ed61-4195-ba8c-2a9f26317642',
                         '86d906d2-f44f-4743-9044-f7b23df6d5d8',
                         'c253083f-a2f9-4bec-a07f-8883637125db',
                         '407b2857-e5cd-4805-9b2c-c43c2e819b04',
                         '63987b56-7200-4a0d-9db5-4f01470da996',
                         'bdab2e43-5e2c-43b9-bd1d-26707aa9806d',
                         '44a88f6b-8b20-4a1b-835a-ad37193d7dc4',
                         '456f4de6-c474-43a3-8417-08ec374a27b7',
                         'f09992f0-ef48-4fb8-ad08-0f9a718aee54',
                         'b21c3ad3-d3df-4e3b-997a-d184a26a377d',
                         'c961c4c8-22e1-47fd-8e4d-bef66c962303',
                         '97759fac-b25e-449b-b9da-2be2818a978c',
                         '3a7a4451-dceb-439b-aab3-9e968bd5be1b',
                         'a4194db7-7d4b-4deb-9b1e-4f42ab5ded94',
                         'bbbaa09b-b314-4123-a578-2e4b3f8d0b97',
                         'e6126713-09aa-4a04-8f60-414dbd4125e5',
                         '691853b9-3634-440d-a4b5-12d0c2020125',
                         '6bc5a76c-b45a-4489-b206-a21aca3e7fd3',
                         '4fa32ede-c17d-4e0e-b8bc-2d5ced4b2dab',
                         '6cf6bb59-08bb-4a78-9bfd-d82727f7e2b8',
                         'b220398e-6f51-4568-978d-8e632cab00be',
                         '2363acaa-e9d3-48df-8753-cac4c708a2fc',
                         '8041f3fc-fc3e-4360-b732-105d9d599ee3',
                         'af2b1579-175a-4ce9-9c40-d97912002be9',
                         '2443614a-fe92-4667-9baa-51392342ec39',
                         'a5b16727-5cf4-4a49-8732-03dddf6ed311',
                         'db534cf4-aaaa-4e21-a096-da10d7cb32de',
                         '21b2dc49-e6b3-4284-9201-a458c1207276',
                         '86ef76cc-5d32-4b8d-baba-68036814bc56',
                         'b5b344b2-963b-4ea5-9dec-9bf0569745f1',
                         '29f76b3f-fb06-4712-acf9-d69af5e5324b',
                         '6add2fc3-e393-40d6-bc32-6b5c9abf5622',
                         '958d637a-6937-4b38-b070-09cfbc8a77ff',
                         '3180d108-b1ef-4aae-ac29-fa2c59a223f2',
                         '7e381832-1a9c-40cf-aac5-93d0c929a415',
                         '81cf6b23-151a-4911-9e93-1b8fa8c6b2a6',
                         'a346544d-58ff-42c2-98ac-5b4d78235039',
                         'c1143a94-b5d5-4a61-819a-bf5ea8b8f13f',
                         'e7330887-acd7-432c-91b4-e76d63882bcc',
                         '00fc5551-2a08-4f3b-b50f-c30c75909a0f',
                         'e5f3f12e-a842-4424-adf6-84f39ff79959',
                         '6e039512-c2c5-48bb-af12-a93fe5d7e6d8',
                         '64fab82b-ce76-433b-983f-79549ea0b954',
                         '636c193e-a744-4e78-bab1-fb30266d0e20',
                         '9fc60df9-496f-4116-abfd-03bf46e93269',
                         '489839c0-f6be-43d6-b7a8-692c2ade9703',
                         '3cb0a598-8d9d-4477-8dce-4665083f82df',
                         '78637787-132d-4745-a98a-74b1ab578c95',
                         '96671bb8-c450-47f6-9b08-ff07aea0af08',
                         'ea055999-fcfb-4315-aa4a-a9e48934d59a',
                         'af627631-0653-4281-94ff-64d0a8745c8c',
                         '31f862bf-b034-4c79-973d-39ba26bdc1f7',
                         '88d67af0-ab70-4fd9-a39c-2923502a0846',
                         '47cfb5e3-9d90-4fe2-8eb0-6c4933a1d299',
                         '2443a88b-95e5-47df-9a02-363e130013d0',
                         'c317355a-180b-447f-b406-d6dbbeadc17f',
                         '4ff66c5e-becb-4f0c-bb33-59f5546311f4',
                         '77791c29-90ec-485a-9cef-298b9b575dd2',
                         'f48b8eb2-a338-45fd-b63d-3c00d266d388',
                         '205013a3-b967-4b42-ac0b-9ffe99fe88f9',
                         'f9453d8c-2085-4435-840f-3ddcd79f788f',
                         '598a7f46-b0e9-40b6-b4b4-1312e6238819',
                         '51bc43a2-1ee7-4f37-a3b1-e81aec1135e0',
                         '14ebb121-7602-4644-81b3-6e171cea19ab',
                         '1e5583d4-24f0-4a45-b712-f753eb48c8f9',
                         'd4d13b86-435f-4fe6-bb74-6a00cd41b174',
                         'c4658141-4d39-44bf-8c16-dab5919431ef',
                         'eeb437e8-6861-4f2c-a545-6d54c5c83dfa',
                         '041c5758-d2aa-473c-b3f1-20fc529056cd',
                         'abf596f7-aefd-4938-86b0-49e75fdf6511',
                         '012590a5-15e9-445a-b75f-e41a9d0688cf',
                         '1f54eacd-2004-4b9b-8f29-c67d94f74103',
                         '3217fb80-e129-424a-891b-e1b32e10eead',
                         '62c01607-c063-49cd-ac39-ea1541243c44',
                         '68bfde5c-92b7-4188-b2a2-bb96abfc174e',
                         'a427afb1-a183-4d92-88eb-2a40e4a00058',
                         'f483e292-24b6-4d76-af72-8b13c9a5c596',
                         'a60089b0-71d7-487d-9102-1e8b52789bf7',
                         '19e880a8-b886-436c-885e-cc5ce11cb284',
                         '5975a1d5-f43e-441e-a758-b2d4913dc543',
                         '2765a380-21ca-4989-b14a-1d69eea9f8c4',
                         '827f5d7c-e0fa-4725-91dd-a7a93149b1ad',
                         'b7faa7e3-f518-4cf0-8bbc-c10bb49c0b4b',
                         '491f80c6-1e45-4a6e-8233-42a1cde8b5d7',
                         'd9b350f8-3ed0-4333-bd13-dccd363020bd',
                         '3ae759ca-ba9e-43dd-8e64-270fdf0d1b38',
                         '04627edc-a358-451a-9772-d98084e81a36',
                         '23706cd0-0097-4665-b9b1-9b10647a87a4',
                         '71bf6c25-c8a7-4479-8265-f0aa80b9b606',
                         '55afee91-a15f-48a7-ab49-116b51a831cd',
                         '71cd83d1-ca13-4be2-807b-5740bcc42ba8',
                         '9355caa3-2050-4161-a218-cf6f7d06538f',
                         'eda307c8-8f67-4182-be28-111e81db0c12',
                         '27c08d47-f440-44ee-a6b8-6d673fbd7f20',
                         '736a18f7-9ec1-4b13-896b-7d8f03d3d1b7',
                         '8521fb49-fdc8-454b-b129-49efcd25c933',
                         '4f3017e8-baf9-4b41-b1fb-02bac76b7bfa',
                         'c1ede711-9b95-4866-bd9c-e9b4f551555e',
                         '303d6411-e393-4b4a-b5a6-79c75a4d33e1',
                         '6985bbf7-0f97-40a8-8c06-875e31631bc6',
                         'c29973e2-baea-429d-9f4c-42f33fa8edd4',
                         '4039039a-c395-4fd1-b7b2-379910df2494',
                         'e7aedf63-6418-4a8f-8d99-a5d93ca41f89',
                         'e4fbdffd-d9fe-4f31-a613-516385c7d325',
                         'ceed29aa-0145-4c77-a032-2c1546682612',
                         'e9097f25-cb68-44d5-8709-f7ccfa3d36d6',
                         'c31449fa-9102-4a46-8264-022d529d4f38',
                         '1f0bbcce-801e-4736-b5ab-c8afee6e8521',
                         'd1c666b6-8433-4afa-b2f0-264828b2781a',
                         '4849b8dd-cce8-4302-b77e-5bf28a555229',
                         'd15703be-5c42-45ad-bebb-a5a438cf7fb4',
                         'd6b5cb76-843b-48b7-a0f1-645caf9a178e',
                         '1bb5e368-fca1-4b8b-8ff7-7b84285509ed',
                         'f47bde61-d1c3-4910-9263-3f7ff982f989',
                         'd0bc99af-af04-4a54-9bc5-a2783a783c1a',
                         'def57525-ba02-4aea-a79a-ab2513f0a7eb',
                         '67bb881d-808f-41ba-a336-27a57111ee1d',
                         '0b652f14-8d13-49d7-94fd-8c39a72f4033',
                         'e9361bd1-9e3b-41e4-b83b-576aa83bd08b',
                         '2846e0d2-34c6-4a20-a43e-4c11c0e1f351',
                         '6564bc9a-aef4-48cf-b517-69848358f3e0',
                         'ac5162bd-191b-4ff1-8cd2-e4a1603981a7',
                         'e5529a87-915c-4e75-9376-9bc1706cb9d8',
                         '2d8c280d-8de5-4792-bf25-08ad5f1cd35a',
                         'e643f8a3-b03a-4a03-8c26-19c6bcf8538f',
                         '37e5335a-42bc-4a25-840a-e82e820f4f15',
                         'a489a772-08f7-49c9-8bbc-814cfdcf1525',
                         '84cc43d5-72ed-4f01-918e-86ecd7464079',
                         '786fa276-8baa-4315-8f72-1da2e0c888a6',
                         '94a659ce-dd98-44a1-a3ea-2a8abc622990',
                         '81a8c965-37c8-4d64-8da1-bdac3f098032',
                         'fd5cd4f8-0406-45ca-ae1d-ee285d94e281',
                         'ee520d1f-8d64-4f73-9bec-4ae318f350cf',
                         '670644a6-4acf-45ee-8bd5-811146ad5d28',
                         '77f470aa-4a1a-4297-8f93-c43b2d93e649',
                         '4f566336-c5cd-4353-9213-faa4411d5b2d',
                         '443462ad-4de0-4d6f-bfbc-bc8c1404b131',
                         '83e6cb7b-5f2d-4c5b-a9d1-0be071d6e956',
                         'f6efd6e9-ea2d-4a8f-baeb-6fe12a86f7d8',
                         'cc9ab419-4f09-4812-8292-151f008c6e32',
                         '4f6e842e-8556-448b-9ebf-93ad06a333a5',
                         '219bfbb0-03ff-4be4-a8c1-5eb98ab6fe6c',
                         '9ef90251-e2b8-411b-845c-f980d2ca1427',
                         'e6e54c47-290c-4c8b-a2b3-dd30c39a361f',
                         'a2053871-6568-4969-8eac-8820fd67d928',
                         'fcb4209d-f752-4898-aa7a-b9be066dfb0d',
                         '0bc88846-bf92-4040-8bb9-a57f3efb9004',
                         'da9822ab-4990-4333-982a-9e52d2b77260',
                         'e0020b70-4f76-4b81-99f3-cfcf22d2c004',
                         '1ca19a30-1b67-4dd3-9994-c2048813aeff',
                         '0e656272-03c2-41a9-8935-60444909082f',
                         '7770dcf2-c2c4-4161-b442-c779ab9725e2',
                         '148d49f3-84ca-4d5d-b89b-7dd8b7d7a902',
                         'f5a4cf17-0b36-41e4-a3b9-6019d67bc7ae'
    )
  and fe_source.organisation_id = 1
  and fe_target.uuid = fe_source.uuid
  and fe_target.organisation_id = 19;
```

**14.  program_organisation_config:** 
```sql
insert into program_organisation_config (uuid, program_id, organisation_id, visit_schedule, version, audit_id,
                                         is_voided, created_by_id, last_modified_by_id, created_date_time,
                                         last_modified_date_time)
select uuid_generate_v4(),
       program_id,
       19,
       visit_schedule,
       version,
       audit_id,
       is_voided,
       1,
       1,
       now(),
       now()
from program_organisation_config
where uuid in (
    '560cc651-95ce-4f73-b685-1cac17eac5cb'
    )
  and organisation_id = 1;

update program_organisation_config poc_target
set program_id      = newprog.id,
    organisation_id = 19
from program_organisation_config poc_source
         join program org1prog on poc_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where poc_source.uuid in (select uuid
                          from program_organisation_config
                          where organisation_id = 1)
  and poc_source.organisation_id = 1
  and poc_target.uuid = poc_source.uuid
  and poc_target.organisation_id = 19;
```

#### Step 3: Migration of base tables that use `subject_type_id`, `program_id` and `encounter_type_id` columns:
After completing the migration of base tables that use the `organisation_id` column, the next step is to migrate related tables that use `subject_type_id`, `program_id` and `encounter_type_id` columns.

```sql
select distinct columns.table_name
from information_schema.columns columns
         join information_schema.tables tables on columns.table_name = tables.table_name
where column_name = 'subject_type_id'
  and tables.table_schema = 'public'
  and columns.table_schema = 'public'
  and table_type = 'BASE TABLE';
```

```sql
select distinct columns.table_name
from information_schema.columns columns
         join information_schema.tables tables on columns.table_name = tables.table_name
where column_name = 'program_id'
  and tables.table_schema = 'public'
  and columns.table_schema = 'public'
  and table_type = 'BASE TABLE';
```

```sql
select distinct columns.table_name
from information_schema.columns columns
         join information_schema.tables tables on columns.table_name = tables.table_name
where column_name = 'encounter_type_id'
  and tables.table_schema = 'public'
  and columns.table_schema = 'public'
  and table_type = 'BASE TABLE';
```
The following is a list of entities that require update queries to be written and executed:
- `form_mapping`: needs `subject_type_id` column to be updated to the new corresponding id.
- `group_privilege`:  `subject_type_id `, `program_id`, `program_encounter_type_id`, `encounter_type_id` columns to be updated
- ~`individual`~: to be ignored and do not require updates
- `operational_subject_type`: `subject_type_id` column to be updated
- ~`reset_sync`~: to be ignored and do not require updates
- `subject_migration`: `subject_type_id` column to be updated
- `operational_program`:  `program_id` column to be updated
- ~`program_enrolment`~: to be ignored and do not require updates
- `program_organisation_config`: `program_id` column to be updated
- `subject_program_eligibility`: `program_id` column to be updated
- ~`encounter`~: to be ignored and do not require updates
- `operational_encounter_type`: `encounter_type_id` column to be updated
- ~`program_encounter`~: to be ignored and do not require updates

#### Step 4: Entities that are to be updated:
On doing so the previous step, the following is a list of entities that require update queries to be written and executed:
- `form_mapping`
- `group_privilege`
- `operational_subject_type`
- `subject_migration`
- `operational_program`
- `program_organisation_config`
- `subject_program_eligibility`
- `operational_encounter_type`


Firstly, the goal was to update the `form_mapping`, `group_privilege`, `operational_subject_type`, and `subject_migration` tables. Each of these tables had a column for `subject_type_id` that needed to be consistent with the correct entity for the organization. Given that there was only one subject type to deal with, the process of aligning this `subject_type_id` across all four entities was relatively straightforward.

**1. To update the `form_mapping` Table:**
```sql
update form_mapping
set subject_type_id = (select id from subject_type where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where organisation_id = 19
  and subject_type_id = 1;
```
**2. To update the `group_privilege` table's `subject_type_id` column:**
```sql
update group_privilege
set subject_type_id = case
                          when subject_type_id = 1 then (select id
                                                         from subject_type
                                                         where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
                          else subject_type_id end;
```
**3. To update the `operational_subject_type` Table:**
```sql
update operational_subject_type
set subject_type_id = (select id from subject_type where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where uuid = '5ff9c6e0-ed73-4b40-8109-95d4b2a1d042'
  and organisation_id = 19;
```
**4. To update the `subject_migration` Table:**
```sql
update subject_migration
set subject_type_id = (select id from subject_type where subject_type.uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3')
where organisation_id = 19;
```

Similarly, `program_id ` needed to be updated across `group_privilege`, `operational_program`, `program_organisation_config`, and `subject_program_eligibility`. 

**5. To update the `group_privilege` Table:**
```sql
update group_privilege gp_target
set program_id = newprog.id
from group_privilege gp_source
         join program org1prog on gp_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where gp_source.uuid in (select uuid
                         from group_privilege
                         where group_privilege.program_id = 1
                         or group_privilege.program_id = 2)
  and gp_target.uuid = gp_source.uuid;
```
**6. To update the `operational_program` Table:**
```sql
update operational_program op_target
set program_id = newprog.id
from operational_program op_source
         join program org1prog on op_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where op_source.uuid in (
                         '61383d58-82b4-44fb-96d0-6449f0e68c1b',
                         'fc3cfcbe-9427-49d0-a497-8294d16725af'
    )
  and op_target.uuid = op_source.uuid
  and op_target.organisation_id = 19;
```
**7. To update the `program_organisation_config` Table:**
```sql
update program_organisation_config poc_target
set program_id = newprog.id
from program_organisation_config poc_source
         join program org1prog on poc_source.program_id = org1prog.id
         join program newprog on org1prog.name = newprog.name and newprog.organisation_id = 19
where poc_source.uuid in (select uuid
                          from program_organisation_config
                          where program_organisation_config.organisation_id = 19)
  and poc_target.uuid = poc_source.uuid
  and poc_target.organisation_id = 19;
```
**8. To update the `subject_program_eligibility` Table:**
Ignoring! since there were no records associated with organization_id 1

Similarly, the `program_encounter_type_id` and `encounter_type_id` columns in the `group_privilege` table, along with the `encounter_type_id` in the `operational_encounter_type` table, required updating to align with the new organizational structure.

**9. To update the `group_privilege` Table:**
Migration was not required for `encounter_type_id` as the records were already updated with organization 19, but it was necessary for `program_encounter_type_id`.

```sql
update group_privilege gp_target
set program_encounter_type_id = newet.id
from group_privilege gp_source
         join encounter_type org1et on gp_source.program_encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid
where gp_source.uuid in (select uuid
                         from group_privilege
                         where program_encounter_type_id in (2, 3, 4, 5, 6, 13, 20, 21))
  and gp_target.uuid = gp_source.uuid;
```

**10. To update the `operational_encounter_type` Table:**
```sql
update operational_encounter_type oet_target
set encounter_type_id = newet.id
from operational_encounter_type oet_source
         join encounter_type org1et on oet_source.encounter_type_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where oet_target.uuid in (
                          '160c7f42-392c-41f9-af82-5e483109918a',
                          '9b4fa8ec-fd62-487a-aa35-8f74f3c20db2',
                          'ec3d643a-6da4-417e-8ee5-2654344f1756',
                          'f30945dd-7768-4a7e-bce9-2c96a6834373',
                          '73854e01-75db-4043-acbd-c9d4838e4705',
                          '37ad819f-3700-466d-9af9-565c1a43b52c',
                          '8281d9a4-9a44-4869-8b92-47feefc5d1f6',
                          '93617150-2536-46ad-9879-0ba4fccd1f4e'
    )
  and oet_target.uuid = oet_source.uuid;
```

#### Step 5: Removing Parent Organization Dependency:
Finally, dependency on the parent organization was removed, ensuring that Calcutta Kids no longer inherited settings, permissions, or data from Org 1.
```sql
update organisation
set parent_organisation_id = null
where id = 19;
```

#### Step 6: Resolving Reference Issues:

Upon review, it was identified that the columns `entity_id` and `observations_type_entity_id` were not being referenced during the initial table creation schema. These columns are integral as they establish references to the `program` and `encounter_type` entities, respectively. Due to this, these incorrect references led to the error 'Unable to find org.avni.server.domain.Program with id 1'.

To address these issues,  updates were applied to these columns to ensure they correctly refer to the corresponding entity IDs as per the new organizational structure.

```sql
update form_mapping fm_target
set entity_id = newprogram.id
from form_mapping fm_source
         join program org1program on fm_source.entity_id = org1program.id
         join program newprogram on org1program.uuid = newprogram.uuid and newprogram.organisation_id = 19
where fm_source.uuid in (select uuid
                         from form_mapping
                         where entity_id in (1, 2))
  and fm_target.uuid = fm_source.uuid
  and fm_target.organisation_id = 19;
```

```sql
update form_mapping fm_target
set observations_type_entity_id = newet.id
from form_mapping fm_source
         join encounter_type org1et on fm_source.observations_type_entity_id = org1et.id
         join encounter_type newet on org1et.uuid = newet.uuid and newet.organisation_id = 19
where fm_source.uuid in (select uuid
                         from form_mapping)
  and fm_target.uuid = fm_source.uuid
  and fm_target.organisation_id = 19;
```

After futher review, when we again stuck with same kinda issue, we realized that our initial updates were incomplete. We updated entities with new records for our current organization, Org 19, but some existing records were still linked to the old organization, Org 1. This means we still had some leftover connections to Org 1, which could cause data mismatches.

To fix this, we need to update all the relevant records in each entity, not just the ones we added in step 2. This will include changing references in existing records that might still point to Org 1, ensuring that every piece of our data is now correctly linked to Org 19.
By following the above steps and recommendations, the dependency of Calcutta Kids organization's implementation on Org 1 can be successfully removed without causing any disruptions or issues.

Example: Theere was a table form_mapping, and in this table, a record is supposed to link to a form specific to Org 19. However, this record is incorrectly linked to a form from Org 1. Because Org 19 doesn't have a form with the same ID as in Org 1, this mismatch triggers an error like 'Unable to find org.avni.server.domain.Form with id 21'.

```sql
update form_mapping fm_target
set form_id = newform.id
from form_mapping fm_source
         join form org1form on fm_source.form_id = org1form.id
         join form newform on org1form.uuid = newform.uuid and newform.organisation_id = 19
where fm_source.uuid in (select uuid
                         from form_mapping)
  and fm_target.uuid = fm_source.uuid
  and fm_target.organisation_id = 19;
```

```sql
update form_element fe_target
set concept_id = newconcept.id
from form_element fe_source
         join concept org1concept on fe_source.form_element_group_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where fe_source.uuid in (select uuid
                         from form_element)
  and fe_target.uuid = fe_source.uuid
  and fe_target.organisation_id = 19;
```

```sql
update concept_answer ca_target
set concept_id = newconcept.id
from concept_answer ca_source
         join concept org1concept on ca_source.concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where ca_source.uuid in (select uuid
                         from concept_answer)
  and ca_target.uuid = ca_source.uuid
  and ca_target.organisation_id = 19;
```

```sql
update concept_answer ca_target
set answer_concept_id = newconcept.id
from concept_answer ca_source
         join concept org1concept on ca_source.answer_concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where ca_source.uuid in (select uuid
                         from concept_answer)
  and ca_target.uuid = ca_source.uuid
  and ca_target.organisation_id = 19;
```

```sql
update checklist_item_detail cid_target
set concept_id = newconcept.id
from checklist_item_detail cid_source
         join concept org1concept on cid_source.concept_id = org1concept.id
         join concept newconcept on org1concept.uuid = newconcept.uuid and newconcept.organisation_id = 19
where cid_source.uuid in (select uuid
                          from checklist_item_detail)
  and cid_target.uuid = cid_source.uuid
  and cid_target.organisation_id = 19;
```


By following the above steps and recommendations, the dependency of Calcutta Kids organization's implementation on Org 1 was successfully removed without causing any issues.

With the previous steps completed, the remaining task is to write and implement the skip logic and rules specific to the Calcutta Kids organization's implementation. 

Once the skip logic and rules are written and tested, the Calcutta Kids organization's database and application setup will be entirely independent of Org 1 and fully customized to their specific operational needs.
