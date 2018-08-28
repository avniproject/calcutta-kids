-- TODO
-- Enrolment UUID
-- Some data is in non-event model. But the mapping would need to be done to event model.
-- To deal with we can capture the information in encounter also. In some cases we may have to create multiple encounters
-- on the same date, each capturing certain fields. For date of encounter we can pick some date in the entity model for
-- the encounter date, if possible. Discuss if a suitable date is found

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

CREATE TABLE mother_enrolment (
  id             SERIAL,
  enrolment_uuid varchar(255) not null default uuid_generate_v4(),
  mother_id      int REFERENCES mother (id)
);

drop view pregnant;
create view pregnant AS
  select
    m.uuid,
    m.id            mother_id,
    wr.entity_id as woman_registration_id
  from mother m
    inner join woman_registration wr ON wr.entity_id != '' AND wr.entity_id :: INT = m.id;

insert into mother_enrolment (mother_id)
select distinct id from mother;
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
  pregnancy_registration.*,
  pregnancy_detail.*,
  pregnancy_registration.enrolment_uuid
from pregnancy_registration
  inner join pregnancy_detail on pregnancy_registration.pregnancydetailid::int = pregnancy_detail.id
inner join mother on pregnancy_registration.entity_id != '' AND pregnancy_registration.entity_id :: INT = mother.id;

-- Mother Enrolment
select
  m2.uuid as individual_uuid,
  reg.enrolment_uuid
from mother_enrolment reg join mother m2 on reg.mother_id = m2.id;

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
  cr.babyweight                                                                AS "Weight",
  status.active,
  status.start_date,
  status.end_date
FROM child c
  INNER JOIN child_registration cr ON c.id = cr.entity_id :: INT
  INNER JOIN mother m ON m.id = c.id
  INNER JOIN woman_registration wr ON wr.entity_id != '' AND wr.entity_id :: INT = m.id
  LEFT OUTER JOIN child_status status on status.child_id = c.id;

-- PROGRAM__ENC_TYPE__ENC_NAME
-- Pregnancy__ANC__ANC_1
select
  mother.uuid as individual_uuid,
  reg.enrolment_uuid,
  tr.*
from anc_first_trimester tr
 inner join mother on mother.id = tr.entity_id::int
 inner join pregnancy_registration reg on reg.entity_id != '' AND reg.entity_id :: INT = tr.entity_id::int
   and tr.date::DATE BETWEEN lastmenstrualperiod::DATE AND (lastmenstrualperiod::DATE + '4 month'::INTERVAL);
-- Pregnancy__ANC__ANC_2
select
   m.uuid,
   reg.enrolment_uuid,
   tr.*
from anc_second_trimester tr
 inner join pregnancy_registration reg on reg.entity_id != '' AND reg.entity_id :: INT = tr.entity_id :: int
    and tr.date::DATE BETWEEN (lastmenstrualperiod::DATE + '3 month'::INTERVAL) AND (lastmenstrualperiod::DATE + '7 month'::INTERVAL)
-- 3 & 7 are rough numbers to group encounters of an enrolment, if there are multiple pregnancy for an individual
 inner join mother m on m.id = tr.entity_id :: int;
-- Pregnancy__ANC__ANC_3
select
   m.uuid,
   reg.enrolment_uuid,
   tr.*
from anc_third_trimester tr
 inner join pregnancy_registration reg on reg.entity_id != '' AND reg.entity_id :: INT = tr.entity_id :: int
    and tr.date::DATE BETWEEN (lastmenstrualperiod::DATE + '6 month'::INTERVAL) AND (lastmenstrualperiod::DATE + '11 month'::INTERVAL)
-- 6 & 11 are rough numbers to group encounters of an enrolment, if there are multiple pregnancy for an individual
 inner join mother m on m.id = tr.entity_id :: int;

-- Pregnancy__Lab_Tests
select
  mother.uuid individual_uuid,
  reg.enrolment_uuid,
  woman_lab_test_form.*,
  f.*,
  urinetest_woman_lab_test_form.*,
  usg_woman_lab_test_form.*
from woman_lab_test_form
  left outer join bloodtests_woman_lab_test_form f on woman_lab_test_form.id = f.parent_id
  left outer join mother on mother.id = woman_lab_test_form.entity_id :: int
  left outer join urinetest_woman_lab_test_form on woman_lab_test_form.id = urinetest_woman_lab_test_form.parent_id
  left outer join test_woman_lab_test_form on woman_lab_test_form.id = test_woman_lab_test_form.parent_id
  left outer join usg_woman_lab_test_form on woman_lab_test_form.id = usg_woman_lab_test_form.parent_id
  left outer join pregnancy_registration reg on reg.entity_id = woman_lab_test_form.entity_id
     and woman_lab_test_form.today::DATE between reg.lastmenstrualperiod::DATE AND (reg.lastmenstrualperiod::DATE + '45 week'::INTERVAL)
where beneficiarytype = 'pregnantWoman' and mother.uuid is not null
order by mother.uuid, reg.enrolment_uuid;
-- Mother__Lab_Tests
select
  mother.uuid individual_uuid,
  reg.enrolment_uuid,
  woman_lab_test_form.*,
  f.*,
  urinetest_woman_lab_test_form.*,
  usg_woman_lab_test_form.*
from woman_lab_test_form
  left outer join bloodtests_woman_lab_test_form f on woman_lab_test_form.id = f.parent_id
  left outer join mother on mother.id = woman_lab_test_form.entity_id :: int
  left outer join urinetest_woman_lab_test_form on woman_lab_test_form.id = urinetest_woman_lab_test_form.parent_id
  left outer join test_woman_lab_test_form on woman_lab_test_form.id = test_woman_lab_test_form.parent_id
  left outer join usg_woman_lab_test_form on woman_lab_test_form.id = usg_woman_lab_test_form.parent_id
  left outer join mother_enrolment reg on reg.mother_id = mother.id
where beneficiarytype = 'mother' and mother.uuid is not null
order by woman_lab_test_form.id;
-- Child__Lab_Tests
select
  child.uuid individual_uuid,
  cr.enrolment_uuid,
  test_child_lab_test_form.*
from test_child_lab_test_form
  inner join child on child.id = test_child_lab_test_form.parent_id :: int
  INNER JOIN child_registration cr ON child.id = cr.entity_id :: INT;

-- Child__Doctor_Visit_V1
select
  child.uuid as individual_uuid,
  cr.enrolment_uuid,
  child_doctor_visit.*,
  tests_child_doctor_visit.*
from child_doctor_visit
  left outer join tests_child_doctor_visit on child_doctor_visit.id = tests_child_doctor_visit.parent_id
  left outer join child on child.id = child_doctor_visit.entity_id :: int
  left outer JOIN child_registration cr ON child.id = cr.entity_id :: INT;
-- Child__Doctor_Visit_V2
select
  child.uuid as individual_uuid,
  cr.enrolment_uuid,
  child_doctor_visit_and_follow_up.*,
  tests_child_doctor_visit_and_follow_up.*,
  medications_child_doctor_visit_and_follow_up.*
from child_doctor_visit_and_follow_up
  left outer join tests_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = tests_child_doctor_visit_and_follow_up.parent_id
  left outer join child on child.id = child_doctor_visit_and_follow_up.entity_id :: int
  left outer join child_registration cr on cr.entity_id :: INT = child.id
  left outer join medications_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = medications_child_doctor_visit_and_follow_up.parent_id;

select
  child.uuid as individual_uuid,
  cr.enrolment_uuid,
  child_doctor_visit_and_follow_up.*,
  tests_child_doctor_visit_and_follow_up.*,
  medications_child_doctor_visit_and_follow_up.*,
  followupform_child_doctor_visit_and_follow_up.*
from child_doctor_visit_and_follow_up
  left outer join tests_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = tests_child_doctor_visit_and_follow_up.parent_id
  left outer join child on child.id = child_doctor_visit_and_follow_up.entity_id :: int
  INNER JOIN child_registration cr ON child.id = cr.entity_id :: INT
  left outer join medications_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = medications_child_doctor_visit_and_follow_up.parent_id
  left outer join followupform_child_doctor_visit_and_follow_up on child_doctor_visit_and_follow_up.id = followupform_child_doctor_visit_and_follow_up.parent_id;

-- Doctor visit
select
  mother.uuid as individual_uuid,
  me.enrolment_uuid,
  woman_doctor_visit_and_follow_up.*,
  tests_woman_doctor_visit_and_follow_up.*,
  medications_woman_doctor_visit_and_follow_up.*,
  followupform_woman_doctor_visit_and_follow_up.*
from woman_doctor_visit_and_follow_up
  inner join mother on mother.id = woman_doctor_visit_and_follow_up.entity_id :: int
  inner join mother_enrolment me on mother.id = me.mother_id
  left outer join tests_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = tests_woman_doctor_visit_and_follow_up.parent_id
  left outer join medications_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = medications_woman_doctor_visit_and_follow_up.parent_id
  left outer join followupform_woman_doctor_visit_and_follow_up on woman_doctor_visit_and_follow_up.id = followupform_woman_doctor_visit_and_follow_up.parent_id;

-- PNC 1
select
  m2.uuid as individual_uuid,
  reg.enrolment_uuid,
  pnc.*
from delivery_details_and_pnc1 pnc
  inner join mother m2 on pnc.entity_id::int = m2.id
  left join pregnancy_detail pd on pd.id = pnc.pregnancydetailid::int
  left join pregnancy_registration reg on reg.pregnancydetailid :: INT = pd.id;

-- CHILD PNC
select
  c.uuid as individual_uuid,
  reg.enrolment_uuid,
  pnc2.*
from pnc2
  join child_registration reg on pnc2.entity_id = reg.entity_id
  join child c on c.id = reg.entity_id :: int;

-- Child exit form with death as reason
select
  c.uuid as inidivual_uuid,
  reg.enrolment_uuid,
  child_death_form.*
from child_death_form
 left join child c on c.id::int = child_death_form.entity_id::int
 left join child_registration reg on reg.entity_id::int = c.id;

-- Child GMP
select
  c2.uuid as individual_uuid,
  reg.enrolment_uuid,
  gmp.*
from child_gmp gmp
  left join child c2 on gmp.child_id = c2.id
  left join child_registration reg on reg.entity_id::int = c2.id;

-- SES
select
  m2.uuid as individual_uuid,
  enrolment.enrolment_uuid,
  ses_form.* from ses_form
left outer join mother m2 on ses_form.entity_id::int = m2.id
left outer join mother_enrolment enrolment on m2.id = enrolment.mother_id;

-- Mother GMP
select m.uuid as individual_uuid,
       enrolment.enrolment_uuid,
 gmp.*
 from mother_gmp gmp left join mother m on gmp.mother_id = m.id
 left outer join mother_enrolment enrolment on m.id = enrolment.mother_id;

-- Child Home visit
select c.uuid as individual_uuid,
 child_registration.enrolment_uuid,
 visit.*
 from child_home_visit visit left join child c on c.id::int = visit.entity_id::int
 left join child_registration on child_registration.entity_id::int = c.id;

-- Immunisation Taken
select c2.uuid individual_uuid,
       child_registration.enrolment_uuid,
       is2.name as schedule_name, is2.immunisation_window_type as window_type, m.vaccine_name, m.interval_in_days,
t.given_elsewhere, t.immunisation_date taken_date, t.due_date, t.comments
 from taken_immunisation t
 join immunisation_milestone m on t.immunisation_id = m.id
 join immunisation_schedule is2 on m.immunisation_schedule_id = is2.id
 join child c2 on t.child_id = c2.id
 left join child_registration on child_registration.entity_id::int = c2.id;

-- Tables not to be imported
-- bloodtests_lab_test_form, lab_test_form, test_lab_test_form, urinetest_lab_test_form, usg_lab_test_form (seems legacy doesn't have any new data), doctor_visit, woman_doctor_visit, tests_woman_doctor_visit, medications_woman_doctor_visit, medications_doctor_visit, tests_doctor_visit, medications_child_doctor_visit, child_lab_test_form, woman_follow_up, follow_up, child_follow_up
-- no data - woman_death_form
-- NA - child_ses_form, childcalcuttakids_ses_form, community_meeting_attendance
-- child_away_at_village, mother_away_at_village
-- nutrition_corner_attendance
-- due_immunisation
-- child_for_pregnancy
