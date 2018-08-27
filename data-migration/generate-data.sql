-- TODO
-- Enrolment UUID
-- Some data is in non-event model. But the mapping would need to be done to event model. To deal with we can capture the information in encounter also. In some cases we may have to create multiple encounters on the same date, each capturing certain fields. For date of encounter we can pick some date in the entity model for the encounter date, if possible. Discuss if a suitable date is found

-- Pre Scripts
CREATE EXTENSION "uuid-ossp";
ALTER TABLE mother
  ADD COLUMN uuid VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4();
ALTER TABLE child
  ADD COLUMN uuid VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4();
ALTER TABLE child_registration
  ADD COLUMN enrolment_uuid VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4();
ALTER TABLE pregnancy_registration
  ADD COLUMN enrolment_uuid VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4();

drop view pregnant;
create view pregnant AS
  select
    m.uuid,
    m.id            mother_id,
    wr.entity_id as woman_registration_id
  from mother m
    inner join woman_registration wr ON wr.entity_id != '' AND wr.entity_id :: INT = m.id;

-- Mother/Pregnant Registration
SELECT
  m.uuid                                               AS "Individual UUID",
  m.first_name                                         AS "First Name",
  m.last_name                                          AS "Last Name",
  'Female'                                             AS "Gender",
  m.area                                               AS "Address Level",
  coalesce(m.date_of_birth, approxdateofbirth :: DATE) AS "Date Of Birth",
  coalesce(m.beneficiary_id, '')                       AS "Beneficiary id",
  coalesce(m.mychi_id, '')                             AS "myChi id",
  substring(m.address, '([0-9/]+)')                    AS "Household number",
  initcap(wr.floor)                                    AS "Floor",
  substring(wr.address, '\((.*)\)')                    AS "Room number",
  m.phone_number                                       AS "Phone number",
  wr.altphone                                          AS "Alternate phone number",
  CASE WHEN wr.primarycaregiver = 'TRUE'
    THEN 'Yes'
  WHEN 'FALSE'
    THEN 'No'
  END                                                  AS "Is mother the primary caregiver",
  wr.husband_name || ' ' || wr.husband_last_name       AS "Father/Husband",
  initcap(wr.medicalhistory)                           AS "Other medical history"
FROM mother m
  INNER JOIN woman_registration wr ON wr.entity_id != '' AND wr.entity_id :: INT = m.id;

-- Pregnancy Enrolment
select
  mother.uuid as individual_uuid,
  pregnancy_registration.*
from pregnancy_registration
  inner join pregnancy_detail on pregnancy_registration.pregnancydetailid::int = pregnancy_detail.id
inner join mother on pregnancy_registration.entity_id != '' AND pregnancy_registration.entity_id :: INT = mother.id;


-- Child Registration and Enrolment
SELECT
  c.uuid                                                                       AS "Individual UUID",
  cr.enrolment_uuid                                                            AS "Enrolment UUID",
  c.first_name                                                                 AS "First Name",
  c.last_name                                                                  AS "Last Name",
  c.sex                                                                        AS "Gender",
  m.area                                                                       AS "Address Level",
  coalesce(c.date_of_birth, cr.dateofbirth :: DATE, cr.dateofdelivery :: DATE) AS "Date Of Birth",
  coalesce(c.beneficiary_id, '')                                               AS "Beneficiary id",
  coalesce(c.mychi_id, '')                                                     AS "myChi id",
  substring(m.address, '([0-9/]+)')                                            AS "Household number",
  initcap(wr.floor)                                                            AS "Floor",
  substring(m.address, '\((.*)\)')                                             AS "Room number",
  m.phone_number                                                               AS "Phone number",
  wr.altphone                                                                  AS "Alternate phone number",
  CASE WHEN wr.primarycaregiver = 'TRUE'
    THEN 'Yes'
  WHEN 'FALSE'
    THEN 'No'
  END                                                                          AS "Is mother the primary caregiver",
  wr.husband_name || ' ' || wr.husband_last_name                               AS "Father/Husband",
  initcap(cr.medicalhistory)                                                   AS "Other medical history",
  cr.babybirthweight                                                           AS "Birth weight",
  cr.babyweight                                                                AS "Weight"
FROM child c
  INNER JOIN child_registration cr ON c.id = cr.entity_id :: INT
  INNER JOIN mother m ON m.id = c.id
  INNER JOIN woman_registration wr ON wr.entity_id != '' AND wr.entity_id :: INT = m.id;

-- PROGRAM__ENC_TYPE__ENC_NAME
-- Pregnancy__ANC__ANC_1
select
  mother.uuid,
  anc_first_trimester.*
from anc_first_trimester
  inner join mother on mother.id = to_number(anc_first_trimester.entity_id, '99G999D9S');
-- Pregnancy__ANC__ANC_2
select
  mother.uuid,
  anc_second_trimester.*
from anc_second_trimester
  inner join mother on mother.id = to_number(anc_second_trimester.entity_id, '99G999D9S');
-- Pregnancy__ANC__ANC_3
select
  mother.uuid,
  anc_third_trimester.*
from anc_third_trimester
  inner join mother on mother.id = to_number(anc_third_trimester.entity_id, '99G999D9S');

-- Pregnancy__Lab_Tests
select
  mother.uuid individual_uuid,
  woman_lab_test_form.*,
  f.*,
  urinetest_woman_lab_test_form.*,
  usg_woman_lab_test_form.*
from woman_lab_test_form
  left outer join bloodtests_woman_lab_test_form f on woman_lab_test_form.id = f.parent_id
  left outer join mother on mother.id = woman_lab_test_form.entity_id :: int
  left outer join urinetest_woman_lab_test_form on woman_lab_test_form.id = urinetest_woman_lab_test_form.parent_id
  left outer join usg_woman_lab_test_form on woman_lab_test_form.id = usg_woman_lab_test_form.parent_id
where beneficiarytype = 'pregnantWoman' and mother.uuid is not null
order by woman_lab_test_form.id;
select *
from test_woman_lab_test_form;
-- Mother__Lab_Tests
select
  mother.uuid individual_uuid,
  woman_lab_test_form.*,
  f.*,
  urinetest_woman_lab_test_form.*,
  usg_woman_lab_test_form.*
from woman_lab_test_form
  left outer join bloodtests_woman_lab_test_form f on woman_lab_test_form.id = f.parent_id
  left outer join mother on mother.id = woman_lab_test_form.entity_id :: int
  left outer join urinetest_woman_lab_test_form on woman_lab_test_form.id = urinetest_woman_lab_test_form.parent_id
  left outer join usg_woman_lab_test_form on woman_lab_test_form.id = usg_woman_lab_test_form.parent_id
where beneficiarytype = 'mother' and mother.uuid is not null
order by woman_lab_test_form.id;
-- Child__Lab_Tests
select
  child.uuid individual_uuid,
  test_child_lab_test_form.*
from test_child_lab_test_form
  inner join child on child.id = test_child_lab_test_form.parent_id :: int;

-- Child__Doctor_Visit_V1
select
  child.uuid as individual_uuid,
  child_doctor_visit.*,
  tests_child_doctor_visit.*
from child_doctor_visit
  left outer join tests_child_doctor_visit on child_doctor_visit.id = tests_child_doctor_visit.parent_id
  left outer join child on child.id = child_doctor_visit.entity_id :: int;
-- Child__Doctor_Visit_V2
select
  child.uuid as individual_uuid,
  child_doctor_visit_and_follow_up.*,
  tests_child_doctor_visit_and_follow_up.*,
  medications_child_doctor_visit_and_follow_up.*
from child_doctor_visit_and_follow_up
  left outer join tests_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = tests_child_doctor_visit_and_follow_up.parent_id
  left outer join child on child.id = child_doctor_visit_and_follow_up.entity_id :: int
  left outer join medications_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = medications_child_doctor_visit_and_follow_up.parent_id;

select
  child.uuid as individual_uuid,
  child_doctor_visit_and_follow_up.*,
  tests_child_doctor_visit_and_follow_up.*,
  medications_child_doctor_visit_and_follow_up.*,
  followupform_child_doctor_visit_and_follow_up.*
from child_doctor_visit_and_follow_up
  left outer join tests_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = tests_child_doctor_visit_and_follow_up.parent_id
  left outer join child on child.id = child_doctor_visit_and_follow_up.entity_id :: int
  left outer join medications_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = medications_child_doctor_visit_and_follow_up.parent_id
  left outer join followupform_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = followupform_child_doctor_visit_and_follow_up.parent_id;

-- Doctor visit
select
  mother.uuid as individual_uuid,
  woman_doctor_visit_and_follow_up.*,
  tests_woman_doctor_visit_and_follow_up.*,
  medications_woman_doctor_visit_and_follow_up.*,
  followupform_woman_doctor_visit_and_follow_up.*
from woman_doctor_visit_and_follow_up
  inner join mother on mother.id = woman_doctor_visit_and_follow_up.entity_id :: int
  left outer join tests_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = tests_woman_doctor_visit_and_follow_up.parent_id
  left outer join medications_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = medications_woman_doctor_visit_and_follow_up.parent_id
  left outer join followupform_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = followupform_woman_doctor_visit_and_follow_up.parent_id;

-- PNC 1
select
  m2.uuid as individual_uuid,
  delivery_details_and_pnc1.* from delivery_details_and_pnc1
  inner join mother m2 on delivery_details_and_pnc1.entity_id::int = m2.id;
-- PNC 2
select
  m2.uuid as individual_uuid,
  pnc2.* from pnc2
  inner join mother m2 on pnc2.entity_id::int = m2.id;

select * from child_away_at_village;
child_death_form
child_for_pregnancy
child_gmp
mother_gmp
child_home_visit

-- SES
select
  m2.uuid as individual_uuid,
  ses_form.* from ses_form
left outer join mother m2 on ses_form.entity_id::int = m2.id;

child_status

mother_away_at_village

select * from nutrition_corner_attendance;

-- Immunisation
due_immunisation
taken_immunisation
immunisation_milestone
immunisation_schedule



-- Tables not to be imported
-- bloodtests_lab_test_form, lab_test_form, test_lab_test_form, urinetest_lab_test_form, usg_lab_test_form (seems legacy doesn't have any new data), doctor_visit, woman_doctor_visit, tests_woman_doctor_visit, medications_woman_doctor_visit, medications_doctor_visit, tests_doctor_visit, medications_child_doctor_visit, child_lab_test_form, woman_follow_up, follow_up, child_follow_up
-- no data - woman_death_form
-- NA - child_ses_form, childcalcuttakids_ses_form, community_meeting_attendance