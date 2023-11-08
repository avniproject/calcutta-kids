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


#### Step 3: Entities that are updated:
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
  and irt_target.organisation_id = 19;
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

By following the above steps and recommendations, the dependency of Calcutta Kids organization's implementation on Org 1 can be successfully removed without causing any disruptions or issues.
