set role calcutta_kids;

drop view if exists calcutta_kids_individual_away_status;
/*
-- Do not create the calcutta_kids_individual_away_status view
-- It is not used anymore. Just drop it if exists.

create view calcutta_kids_individual_away_status as

(select i.id individual_id,
      case when encounter.cancel_observations @>
       '{"739f9a56-c02c-4f81-927b-69842d78c1e8":"5b30a5b5-8ab5-4643-a424-2992f2b8df11"}' = true
       then 'Yes' else 'No' end as is_away
from latest_program_encounter encounter
      inner join program_enrolment enrolment on enrolment.id = encounter.program_enrolment_id
      right join individual i on enrolment.individual_id = i.id);
*/
drop view if exists active_individuals;

create or replace view active_individuals as
select i.* from individual i
                    left outer join program_enrolment enrolment on i.id = enrolment.individual_id
                    left outer join program_encounter encounter on enrolment.id = encounter.program_enrolment_id
  where (encounter.encounter_date_time > (current_timestamp - interval '5 months 1 seconds')
           or enrolment.enrolment_date_time > (current_timestamp - interval '5 months 1 seconds'))
  group by i.id;

drop view if exists ck_birth_view;
create view ck_birth_view as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         single_select_coded(
               programEnrolment.observations ->> '598ba0e4-ead6-43ac-b6e3-409ac96476e7')::TEXT as "Enl.Mother associated with CK during pregnancy",
         programEnrolment.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enl.Birth Weight",
         single_select_coded(
               programEnrolment.observations ->> '1ae1338b-fa7f-40c0-b11a-232531eb5919')::TEXT as "Enl.Registration at child birth",
         single_select_coded(
               programEncounter.observations ->> '747f9b96-5b88-4f08-b52c-e1a060df4c30')::TEXT as "Enc.Colour of child",
         single_select_coded(
               programEncounter.observations ->> '78cb1fb0-9e7c-4012-872c-00589fda661d')::TEXT as "Enc.Jaundice (Icterus)",
         single_select_coded(
               programEncounter.observations ->> '8ae7a140-900c-4bae-bb20-15b8c883869a')::TEXT as "Enc.Muscle tone",
         single_select_coded(
               programEncounter.observations ->> 'e3158f7c-6349-4e96-8e63-6223f8444500')::TEXT as "Enc.Cried soon after birth",
         single_select_coded(
               programEncounter.observations ->> '24c71448-1068-4dc2-aa2f-8bbb66a5123f')::TEXT as "Enc.Gestational age category at birth",
         programEncounter.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enc.Birth Weight",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = 'fc3cfcbe-9427-49d0-a497-8294d16725af'
    AND oet.uuid = '37ad819f-3700-466d-9af9-565c1a43b52c'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);


drop view if exists ck_child_pnc_view;
create view ck_child_pnc_view as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         single_select_coded(
               programEnrolment.observations ->> '598ba0e4-ead6-43ac-b6e3-409ac96476e7')::TEXT as "Enl.Mother associated with CK during pregnancy",
         programEnrolment.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enl.Birth Weight",
         single_select_coded(
               programEnrolment.observations ->> '1ae1338b-fa7f-40c0-b11a-232531eb5919')::TEXT as "Enl.Registration at child birth",
         programEncounter.observations ->>
         '4629403c-7d38-4984-89cb-8be929b66e69'::TEXT                                        as "Enc.Child Pulse",
         programEncounter.observations ->>
         'c5e0d0e0-4ff7-40be-a929-292d7c4b17d0'::TEXT                                        as "Enc.Child Temperature",
         programEncounter.observations ->>
         'a669a751-574e-4f7b-8c34-d3d755adecf8'::TEXT                                        as "Enc.Child Respiratory Rate",
         single_select_coded(
               programEncounter.observations ->> '24c0eb2b-d6bf-4099-a8d5-0ac2217e98b7')::TEXT as "Enc.Consider a special case",
         single_select_coded(
               programEncounter.observations ->> '2f1bfcdb-343b-4c9e-85c1-63f74607ee6e')::TEXT as "Enc.Refer child to hospital",
         single_select_coded(
               programEncounter.observations ->> 'f123fea3-5051-4b1f-9431-332e76e622f0')::TEXT as "Enc.Refer child to doctor",
         programEncounter.observations ->>
         '72f1ecc4-9f6d-4bab-ba01-a11c822bfb5a'::TEXT                                        as "Enc.General Advice",
         programEncounter.observations ->>
         '9901bdcc-d562-4486-a5d4-b6e9681e9da8'::TEXT                                        as "Enc.Other breast-feeding problems",
         multi_select_coded(
               programEncounter.observations -> 'ea65d8cf-5244-4d38-90f9-67ffc804da8e')::TEXT  as "Enc.Other things baby was fed before breastfeeding",
         multi_select_coded(
               programEncounter.observations -> '53b7549d-f5f2-49b8-9df9-5ab6dcdcb4d3')::TEXT  as "Enc.Why did you feed your baby something other than breast milk?",
         multi_select_coded(
               programEncounter.observations -> '0c9b6203-be8c-40a4-a035-b9cb61f126c9')::TEXT  as "Enc.Breast-feeding problems",
         programEncounter.observations ->>
         '635884c4-dcd6-41a9-85d0-39b19735f80a'::TEXT                                        as "Enc.Other reasons for baby not receiving colostrum",
         programEncounter.observations ->>
         'd1466ada-80e5-4a35-8f7b-a3c7567b685c'::TEXT                                        as "Enc.Any other thing baby was fed before breastfeeding",
         multi_select_coded(
               programEncounter.observations -> '628dd4d4-c25b-4615-970b-667408500aee')::TEXT  as "Enc.Baby did not receive colostrum because",
         multi_select_coded(
               programEncounter.observations -> '49967ea8-e777-41cc-991a-31cb510dc27a')::TEXT  as "Enc.Things baby was fed since beginning breastfeeding",
         single_select_coded(
               programEncounter.observations ->> '6016d125-448b-48ac-9e2f-d3589433a92a')::TEXT as "Enc.Child was first breast fed",
         single_select_coded(
               programEncounter.observations ->> '81c4fa06-e287-4d99-873f-8dd23141ed6a')::TEXT as "Enc.Did the baby receive colostrums (first milk)?",
         programEncounter.observations ->>
         '05a76d7c-aa02-4023-9d98-639c36a269a7'::TEXT                                        as "Enc.Breast feeding started",
         programEncounter.observations ->>
         'dd4e86e4-3c9b-41e2-9852-59d77558b1b8'::TEXT                                        as "Enc.Other things baby was fed since beginning breastfeeding",
         single_select_coded(
               programEncounter.observations ->> 'c41d7a74-716b-4b59-a2eb-61fc688c68bb')::TEXT as "Enc.Was the baby fed anything else before breastfeeding?",
         programEncounter.observations ->>
         '60e2eddd-4e45-4002-bcfd-eea11fb3ac7c'::TEXT                                        as "Enc.Any other reason why you fed something other than breast milk",
         programEncounter.observations ->>
         '16e7abb8-1dee-4f1f-88e0-d9e24f43f720'::TEXT                                        as "Enc.Number of times breastfed in the last 24 hours",
         multi_select_coded(
               programEncounter.observations -> '36460b33-a6c2-478f-894c-491128aa4ca5')::TEXT  as "Enc.Child PNC skin problems",
         multi_select_coded(
               programEncounter.observations -> '2010e1e0-468d-424c-85ef-290612f3eae8')::TEXT  as "Enc.Child PNC eye problems",
         multi_select_coded(
               programEncounter.observations -> '17d5ed6e-b571-4e02-bebe-0c9db2c8f5ca')::TEXT  as "Enc.Child PNC breathing problems",
         programEncounter.observations ->>
         '0a3fb6d3-ea49-4902-95ae-e2514d3739b6'::TEXT                                        as "Enc.Duration in hours between birth and first urination",
         programEncounter.observations ->>
         'cd06dba4-0319-4a0d-a304-9f87908e18a2'::TEXT                                        as "Enc.Number of times urinated in the last 24 hours",
         multi_select_coded(
               programEncounter.observations -> '43a78b5a-f4da-440d-9614-80af65090e1f')::TEXT  as "Enc.Child PNC urination related complaints",
         single_select_coded(
               programEncounter.observations ->> 'b58f5ae0-36f8-4ab9-8331-5597c71a4efb')::TEXT as "Enc.Child passed meconium since birth",
         multi_select_coded(
               programEncounter.observations -> 'bcd4495f-41fa-494b-a5d9-a766c87f37f9')::TEXT  as "Enc.Child PNC stool related complaints",
         programEncounter.observations ->>
         'e7766535-327c-481c-8eb9-bc43cdb2fab5'::TEXT                                        as "Enc.Duration in hours between birth and meconium",
         single_select_coded(
               programEncounter.observations ->> '317ba6a6-d989-45df-82c7-44fc87c0cc32')::TEXT as "Enc.Child passed urine since birth",
         single_select_coded(
               programEncounter.observations ->> 'bc7b0015-ee9a-4089-b0a3-76862a30aa1c')::TEXT as "Enc.Child PNC feeding related complaints",
         multi_select_coded(
               programEncounter.observations -> '23032ec0-3ea7-47f0-a13a-2975dda164f9')::TEXT  as "Enc.Is your baby having any of the following problems?",
         programEncounter.observations ->>
         '26aeaa02-3fdb-4cf5-a6a1-a16e650c1c71'::TEXT                                        as "Enc.Number of days since child passing greenish stool",
         programEncounter.observations ->>
         '7879f94b-31a6-4ac1-b307-284322ef5bef'::TEXT                                        as "Enc.Number of days since child cries while passing stool",
         programEncounter.observations ->>
         'e97d83a0-0519-4dc3-9673-705b66c95e08'::TEXT                                        as "Enc.Other things fed to the baby",
         single_select_coded(
               programEncounter.observations ->> '690af7fc-50d1-4a38-a864-58219ee14da6')::TEXT as "Enc.Feels hot",
         programEncounter.observations ->>
         '0b71db57-0add-4215-b198-0e9773d7da31'::TEXT                                        as "Enc.Number of days of diarrhoea",
         single_select_coded(
               programEncounter.observations ->> 'd6a0c77e-840d-40a2-9282-d22db7ede007')::TEXT as "Enc.Child PNC cry related complaints",
         programEncounter.observations ->>
         '7f169dca-2c2f-473c-a736-b87febd21989'::TEXT                                        as "Enc.Number of days since not passing stool",
         programEncounter.observations ->>
         'e64a7a27-b93d-404e-8cb1-28a2ea2a1b74'::TEXT                                        as "Enc.Number of days since blood in stool",
         single_select_coded(
               programEncounter.observations ->> 'a15faeac-ae32-4acb-aca4-546e0a661fda')::TEXT as "Enc.Feels chill",
         multi_select_coded(
               programEncounter.observations -> 'ad5d7bf8-932a-4eb2-8e8a-7c38dc4bbe2b')::TEXT  as "Enc.Child PNC activity related complaints",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = 'fc3cfcbe-9427-49d0-a497-8294d16725af'
    AND oet.uuid = '73854e01-75db-4043-acbd-c9d4838e4705'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);


drop view if exists ck_child_home_visit_view;
create view ck_child_home_visit_view as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         single_select_coded(
               programEnrolment.observations ->> '598ba0e4-ead6-43ac-b6e3-409ac96476e7')::TEXT as "Enl.Mother associated with CK during pregnancy",
         programEnrolment.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enl.Birth Weight",
         single_select_coded(
               programEnrolment.observations ->> '1ae1338b-fa7f-40c0-b11a-232531eb5919')::TEXT as "Enl.Registration at child birth",
         programEncounter.observations ->>
         'cd06dba4-0319-4a0d-a304-9f87908e18a2'::TEXT                                        as "Enc.Number of times urinated in the last 24 hours",
         single_select_coded(
               programEncounter.observations ->> 'cd923b01-b535-490d-8816-1d4eb682eaec')::TEXT as "Enc.Is your child sick right now?",
         programEncounter.observations ->>
         '0f071c2a-82a7-45cf-8198-90c12ec7a6f3'::TEXT                                        as "Enc.How many times is your child fed in 24 hours?",
         programEncounter.observations ->>
         'f90022c0-e236-4a10-872e-1ed73d50a61b'::TEXT                                        as "Enc.Any other illness?",
         single_select_coded(
               programEncounter.observations ->> 'b37d402b-0439-49d9-8bdd-b13786a1f2b1')::TEXT as "Enc.Has your child been sick in the last 2 weeks?",
         multi_select_coded(
               programEncounter.observations -> '23032ec0-3ea7-47f0-a13a-2975dda164f9')::TEXT  as "Enc.Is your baby having any of the following problems?",
         multi_select_coded(
               programEncounter.observations -> 'c18ef97f-f3ba-4d60-9420-c8f0afa73863')::TEXT  as "Enc.What illness did the child have?",
         single_select_coded(
               programEncounter.observations ->> '24c0eb2b-d6bf-4099-a8d5-0ac2217e98b7')::TEXT as "Enc.Consider a special case",
         single_select_coded(
               programEncounter.observations ->> '3e417584-87dc-41dd-9fd9-87497d560de9')::TEXT as "Enc.Refer child to",
         single_select_coded(
               programEncounter.observations ->> '1eb2875c-8956-4c50-96dd-d53815397cd9')::TEXT as "Enc.Whether attended last community meetup",
         programEncounter.observations ->>
         '0e5f2f1a-ef95-44aa-9a6f-0dc0d1199c37'::TEXT                                        as "Enc.What was the child's age when you started feeding them solids/semi-solids?",
         programEncounter.observations ->>
         '038c0eb4-30d0-487c-b564-6e3bc7c4954b'::TEXT                                        as "Enc.What was the child's age when you started feeding these liquids?",
         single_select_coded(
               programEncounter.observations ->> '9fa6eeb5-c3b9-4052-897e-09c5d4c2119d')::TEXT as "Enc.Are you still breast feeding your child?",
         multi_select_coded(
               programEncounter.observations -> '53b7549d-f5f2-49b8-9df9-5ab6dcdcb4d3')::TEXT  as "Enc.Why did you feed your baby something other than breast milk?",
         single_select_coded(
               programEncounter.observations ->> 'fce06b29-21c5-4ee6-ba49-42c14b7ec112')::TEXT as "Enc.How many times a day is the child eating homemade semi-solid/solid foods?",
         multi_select_coded(
               programEncounter.observations -> '2a5f655e-3351-42c4-87fd-e3a447eeedaa')::TEXT  as "Enc.Food eaten yesterday",
         single_select_coded(
               programEncounter.observations ->> '5a9efcab-a615-4eb0-baf8-b3f799018dca')::TEXT as "Enc.Are you feeding your child any other liquids?",
         multi_select_coded(
               programEncounter.observations -> 'fa9f52fd-300f-4521-9bd6-6bca192fe24c')::TEXT  as "Enc.Have you fed your child any of the following?",
         programEncounter.observations ->>
         '185c6430-e920-4f91-93a6-611affa05794'::TEXT                                        as "Enc.What else did feed your child?",
         programEncounter.observations ->>
         'be8c1e1e-ca8d-4f84-86cb-7304722d0ff4'::TEXT                                        as "Enc.What other snacks are being fed?",
         multi_select_coded(
               programEncounter.observations -> 'a23d8b82-e94c-42db-a67f-394db58cf904')::TEXT  as "Enc.What snacks are being fed?",
         single_select_coded(
               programEncounter.observations ->> 'd1c40171-24f2-440b-bd28-d936a9f0e2d2')::TEXT as "Enc.Have you been feeding solids/semi-solids to the child?",
         single_select_coded(
               programEncounter.observations ->> '3cc301da-e4df-4e0b-add8-9d03f7383310')::TEXT as "Enc.How many times a day is the child eating snacks?",
         programEncounter.observations ->>
         'a0c7b32c-fdb1-4cb6-9bbc-800e74e50cea'::TEXT                                        as "Enc.What was the child's age when you stopped breast feeding?",
         programEncounter.observations ->>
         '60e2eddd-4e45-4002-bcfd-eea11fb3ac7c'::TEXT                                        as "Enc.Any other reason why you fed something other than breast milk",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = 'fc3cfcbe-9427-49d0-a497-8294d16725af'
    AND oet.uuid = 'a43c2b61-7fef-4561-ae55-b58e419a63ce'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);

drop view if exists ck_child_doctor_visit;
create view ck_child_doctor_visit as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         single_select_coded(
               programEnrolment.observations ->> '598ba0e4-ead6-43ac-b6e3-409ac96476e7')::TEXT as "Enl.Mother associated with CK during pregnancy",
         programEnrolment.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enl.Birth Weight",
         single_select_coded(
               programEnrolment.observations ->> '1ae1338b-fa7f-40c0-b11a-232531eb5919')::TEXT as "Enl.Registration at child birth",
         programEncounter.observations ->>
         'c068248d-81cd-4f1e-922f-486be51312ad'::TEXT                                        as "Enc.Doctor's name",
         programEncounter.observations ->>
         'd658b4a4-8ec3-4eb7-9ef3-dd3a73ca29f9'::TEXT                                        as "Enc.Checkup notes",
         programEncounter.observations ->>
         '62a1bac8-6bd8-4cb7-9482-97716928cfe8'::TEXT                                        as "Enc.Para",
         programEncounter.observations ->>
         'b3e9c088-90ed-45d9-8c99-102d1bda66e1'::TEXT                                        as "Enc.Number of living children",
         programEncounter.observations ->>
         'dc2c23e9-19ad-471f-81d1-213069ccc975'::TEXT                                        as "Enc.Gravida",
         programEncounter.observations ->>
         'f8321cb3-df3b-4cec-92ae-8eed77c059e3'::TEXT                                        as "Enc.Abortions",
         programEncounter.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                        as "Enc.Height",
         programEncounter.observations ->>
         '1e2d41a2-5b6a-4ad7-ab91-51d3cdf122bd'::TEXT                                        as "Enc.Diastolic",
         programEncounter.observations ->>
         '2a04bf88-6346-4eda-a86c-8a2afc011b22'::TEXT                                        as "Enc.Systolic",
         programEncounter.observations ->>
         'e6edb61c-c3d9-44c8-abf7-4fd09fe39ec9'::TEXT                                        as "Enc.Temperature",
         programEncounter.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enc.Weight",
         multi_select_coded(
               programEncounter.observations -> 'e1754fdb-1015-4d9e-a6e1-3b9dc8fc0317')::TEXT  as "Enc.Nutrients",
         programEncounter.observations ->>
         '7ac0d759-c50d-4971-88e0-84274224c839'::TEXT                                        as "Enc.BMI",
         single_select_coded(
               programEncounter.observations ->> '6716b050-420f-4234-953a-8385f06121f0')::TEXT as "Enc.Pregnancy test",
         programEncounter.observations ->>
         '1aeda2b1-25e6-4f65-8225-e25293b08344'::TEXT                                        as "Enc.Followup date",
         programEncounter.observations ->>
         '687e183e-2026-49cc-ba21-783695c313e6'::TEXT                                        as "Enc.Other health problem / classification",
         programEncounter.observations ->>
         '7d50833d-4823-4ef2-be52-8b360e75598e'::TEXT                                        as "Enc.Assessment - Notes",
         programEncounter.observations ->>
         'c4b3cee7-e338-4cc5-9027-d105495afbc5'::TEXT                                        as "Enc.Assessment - Diagnosis",
         programEncounter.observations ->>
         'b4096b8d-7b81-4fb6-989c-4a02189c20b6'::TEXT                                        as "Enc.Assessment - Lab tests advice",
         single_select_coded(
               programEncounter.observations ->> 'ab7ad316-6b8a-4860-be3f-16acf3bf707e')::TEXT as "Enc.Refer to hospital",
         programEncounter.observations ->>
         '9e2f03e4-d504-406c-8da7-27eb33e2e298'::TEXT                                        as "Enc.Assessment - Medicine & frequency",
         programEncounter.observations ->>
         '6caeddd6-ffb4-4824-80cc-f7dbda85e9db'::TEXT                                        as "Enc.Chief complaint",
         programEncounter.observations ->>
         'f4b308d3-24a7-4f4a-b06c-bb5432ab989e'::TEXT                                        as "Enc.Assessment - Clinical advice",
         multi_select_coded(
               programEncounter.observations -> '4771de9a-2fe1-4be8-8d8f-a0fded63b9b5')::TEXT  as "Enc.Health problem / Classification",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time"

  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = 'fc3cfcbe-9427-49d0-a497-8294d16725af'
    AND oet.uuid = '4469bcb5-c10c-45dc-ae6e-1b337341c6f8'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);

drop view if exists ck_child_gmp;
create view ck_child_gmp as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         single_select_coded(
               programEnrolment.observations ->> '598ba0e4-ead6-43ac-b6e3-409ac96476e7')::TEXT as "Enl.Mother associated with CK during pregnancy",
         programEnrolment.observations ->>
         '7ff327c5-8678-41e3-af39-c86f214c6f14'::TEXT                                        as "Enl.Birth Weight",
         single_select_coded(
               programEnrolment.observations ->> '1ae1338b-fa7f-40c0-b11a-232531eb5919')::TEXT as "Enl.Registration at child birth",
         single_select_coded(
               programEncounter.observations ->> 'b26ab849-6550-4245-8637-a9fc7fb4eb60')::TEXT as "Enc.Skip capturing height",
         programEncounter.observations ->>
         '8d378a39-2030-4cfe-ac4d-c8e97f718b23'::TEXT                                        as "Enc.Reason for skipping height capture.",
         programEncounter.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enc.Weight",
         single_select_coded(
               programEncounter.observations ->> 'e366e7b5-9c6d-46c3-b3d4-47caecdaa521')::TEXT as "Enc.Child is ill",
         programEncounter.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                        as "Enc.Height",
         single_select_coded(
               programEncounter.observations ->> '227033ee-3a01-4ae6-ba1d-7d54b3091393')::TEXT as "Enc.Child has Diarrhoea",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = 'fc3cfcbe-9427-49d0-a497-8294d16725af'
    AND oet.uuid = '8281d9a4-9a44-4869-8b92-47feefc5d1f6'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);


drop view if exists ck_anc_gmp;
create view ck_anc_gmp as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '2d679fd5-a75b-46bd-96c2-10c180187342'::TEXT                                        as "Enl.Parity",
         programEnrolment.observations ->>
         'd924596e-e08e-4829-b4c3-77a0411d18c7'::TEXT                                        as "Enl.Number of female children",
         programEnrolment.observations ->>
         '1b749b48-bfae-470d-8219-a735dae99f7a'::TEXT                                        as "Enl.Number of male children",
         programEnrolment.observations ->>
         '305f693c-c8b6-4e3e-9a82-a6e91a3e462f'::TEXT                                        as "Enl.Age of youngest child",
         single_select_coded(
               programEnrolment.observations ->> 'b47dca1d-3f42-4280-9b3e-3d68cce88bed')::TEXT as "Enl.Is she on TB medication?",
         single_select_coded(
               programEnrolment.observations ->> '4a20f69f-12c4-4472-ac82-ece0ab102e4b')::TEXT as "Enl.Did she complete her TB treatment?",
         single_select_coded(
               programEnrolment.observations ->> '2a8a5306-c0a9-4ca6-8bd7-b394069aa6f2')::TEXT as "Enl.Has she been taking her TB medication regularly?",
         programEnrolment.observations ->>
         'e638d96b-ad09-4fec-9e01-2e4b1a243c6d'::TEXT                                        as "Enl.Date of deworming",
         programEnrolment.observations ->>
         'f91604a8-89ac-4a99-a3cb-9edd764c8b0e'::TEXT                                        as "Enl.TT1 Date",
         programEnrolment.observations ->>
         'e1b7ce95-8c73-46fa-8354-19a14f5ca17f'::TEXT                                        as "Enl.TT Booster Date",
         programEnrolment.observations ->>
         '57f66ff5-e050-4a72-ad03-94d99dad4630'::TEXT                                        as "Enl.TT2 Date",
         programEnrolment.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                        as "Enl.Height",
         programEnrolment.observations ->>
         '1cc6fd5d-1359-483e-a971-4bf36e34a72d'::TEXT                                        as "Enl.Last menstrual period",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         programEnrolment.observations ->>
         'dde911fa-15eb-4564-8deb-bba46e9d3744'::TEXT                                        as "Enl.Estimated Date of Delivery",
         programEnrolment.observations ->>
         '7ac0d759-c50d-4971-88e0-84274224c839'::TEXT                                        as "Enl.BMI",
         programEnrolment.observations ->>
         '73a3fdd7-3087-4d53-b8be-753e2cdfa6c2'::TEXT                                        as "Enl.Service commitment number",
         single_select_coded(
               programEnrolment.observations ->> 'e0c80ed9-908c-4c93-b3e2-56ac0dfa7087')::TEXT as "Enl.Service commitment type",
         multi_select_coded(
               programEnrolment.observations -> '18fa9773-bf4b-47f8-9535-f1573a477940')::TEXT  as "Enl.Family history",
         programEnrolment.observations ->>
         '2ea977b5-23cb-4833-a5ca-831b12409e41'::TEXT                                        as "Enl.Other family history",
         programEnrolment.observations ->>
         '7d34125a-1b0b-4755-acc8-aeda71af8bd3'::TEXT                                        as "Enl.Other obstetrics history",
         multi_select_coded(
               programEnrolment.observations -> '8a4ab436-6767-45d5-95d7-075d9459609e')::TEXT  as "Enl.Obstetrics history",
         programEnrolment.observations ->>
         'b3e9c088-90ed-45d9-8c99-102d1bda66e1'::TEXT                                        as "Enl.Number of living children",
         programEnrolment.observations ->>
         '73037237-15b7-43ba-b375-2a34af9cc1f5'::TEXT                                        as "Enl.Age at first pregnancy",
         programEnrolment.observations ->>
         '38b9986b-76e8-4015-ae51-48152b1cd42c'::TEXT                                        as "Enl.Number of abortions",
         programEnrolment.observations ->>
         'd7ae1329-9e09-47f1-ad7d-3c73474d973f'::TEXT                                        as "Enl.Number of child deaths",
         single_select_coded(
               programEnrolment.observations ->> 'c357b704-49e2-4c4b-a153-21b8867c152b')::TEXT as "Enl.Is this your first pregnancy?",
         programEnrolment.observations ->>
         '74de4054-0e8b-4088-aae8-bd5f2933d300'::TEXT                                        as "Enl.Number of stillbirths",
         programEnrolment.observations ->>
         'dc2c23e9-19ad-471f-81d1-213069ccc975'::TEXT                                        as "Enl.Gravida",
         programEnrolment.observations ->>
         '99c9d0a3-6ffc-41a7-8641-d79e2e83a4c6'::TEXT                                        as "Enl.Number of miscarriages",
         programEnrolment.observations ->>
         '72f1ecc4-9f6d-4bab-ba01-a11c822bfb5a'::TEXT                                        as "Enl.General Advice",
         programEncounter.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enc.Weight",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = '61383d58-82b4-44fb-96d0-6449f0e68c1b'
    AND oet.uuid = '9b3460bf-73a4-4af9-a21e-41e5cbbc3b97'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);

drop view if exists ck_mother_delivery;
create view ck_mother_delivery as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '2d679fd5-a75b-46bd-96c2-10c180187342'::TEXT                                        as "Enl.Parity",
         programEnrolment.observations ->>
         'd924596e-e08e-4829-b4c3-77a0411d18c7'::TEXT                                        as "Enl.Number of female children",
         programEnrolment.observations ->>
         '1b749b48-bfae-470d-8219-a735dae99f7a'::TEXT                                        as "Enl.Number of male children",
         programEnrolment.observations ->>
         '305f693c-c8b6-4e3e-9a82-a6e91a3e462f'::TEXT                                        as "Enl.Age of youngest child",
         single_select_coded(
               programEnrolment.observations ->> 'b47dca1d-3f42-4280-9b3e-3d68cce88bed')::TEXT as "Enl.Is she on TB medication?",
         single_select_coded(
               programEnrolment.observations ->> '4a20f69f-12c4-4472-ac82-ece0ab102e4b')::TEXT as "Enl.Did she complete her TB treatment?",
         single_select_coded(
               programEnrolment.observations ->> '2a8a5306-c0a9-4ca6-8bd7-b394069aa6f2')::TEXT as "Enl.Has she been taking her TB medication regularly?",
         programEnrolment.observations ->>
         'e638d96b-ad09-4fec-9e01-2e4b1a243c6d'::TEXT                                        as "Enl.Date of deworming",
         programEnrolment.observations ->>
         'f91604a8-89ac-4a99-a3cb-9edd764c8b0e'::TEXT                                        as "Enl.TT1 Date",
         programEnrolment.observations ->>
         'e1b7ce95-8c73-46fa-8354-19a14f5ca17f'::TEXT                                        as "Enl.TT Booster Date",
         programEnrolment.observations ->>
         '57f66ff5-e050-4a72-ad03-94d99dad4630'::TEXT                                        as "Enl.TT2 Date",
         programEnrolment.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                        as "Enl.Height",
         programEnrolment.observations ->>
         '1cc6fd5d-1359-483e-a971-4bf36e34a72d'::TEXT                                        as "Enl.Last menstrual period",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         programEnrolment.observations ->>
         'dde911fa-15eb-4564-8deb-bba46e9d3744'::TEXT                                        as "Enl.Estimated Date of Delivery",
         programEnrolment.observations ->>
         '7ac0d759-c50d-4971-88e0-84274224c839'::TEXT                                        as "Enl.BMI",
         programEnrolment.observations ->>
         '73a3fdd7-3087-4d53-b8be-753e2cdfa6c2'::TEXT                                        as "Enl.Service commitment number",
         single_select_coded(
               programEnrolment.observations ->> 'e0c80ed9-908c-4c93-b3e2-56ac0dfa7087')::TEXT as "Enl.Service commitment type",
         multi_select_coded(
               programEnrolment.observations -> '18fa9773-bf4b-47f8-9535-f1573a477940')::TEXT  as "Enl.Family history",
         programEnrolment.observations ->>
         '2ea977b5-23cb-4833-a5ca-831b12409e41'::TEXT                                        as "Enl.Other family history",
         programEnrolment.observations ->>
         '7d34125a-1b0b-4755-acc8-aeda71af8bd3'::TEXT                                        as "Enl.Other obstetrics history",
         multi_select_coded(
               programEnrolment.observations -> '8a4ab436-6767-45d5-95d7-075d9459609e')::TEXT  as "Enl.Obstetrics history",
         programEnrolment.observations ->>
         'b3e9c088-90ed-45d9-8c99-102d1bda66e1'::TEXT                                        as "Enl.Number of living children",
         programEnrolment.observations ->>
         '73037237-15b7-43ba-b375-2a34af9cc1f5'::TEXT                                        as "Enl.Age at first pregnancy",
         programEnrolment.observations ->>
         '38b9986b-76e8-4015-ae51-48152b1cd42c'::TEXT                                        as "Enl.Number of abortions",
         programEnrolment.observations ->>
         'd7ae1329-9e09-47f1-ad7d-3c73474d973f'::TEXT                                        as "Enl.Number of child deaths",
         single_select_coded(
               programEnrolment.observations ->> 'c357b704-49e2-4c4b-a153-21b8867c152b')::TEXT as "Enl.Is this your first pregnancy?",
         programEnrolment.observations ->>
         '74de4054-0e8b-4088-aae8-bd5f2933d300'::TEXT                                        as "Enl.Number of stillbirths",
         programEnrolment.observations ->>
         'dc2c23e9-19ad-471f-81d1-213069ccc975'::TEXT                                        as "Enl.Gravida",
         programEnrolment.observations ->>
         '99c9d0a3-6ffc-41a7-8641-d79e2e83a4c6'::TEXT                                        as "Enl.Number of miscarriages",
         programEnrolment.observations ->>
         '72f1ecc4-9f6d-4bab-ba01-a11c822bfb5a'::TEXT                                        as "Enl.General Advice",
         programEncounter.observations ->>
         'a70cca4d-2f79-4f39-8839-2683ad43cba4'::TEXT                                        as "Enc.Number of days stayed at the hospital post delivery",
         single_select_coded(
               programEncounter.observations ->> 'ad4da876-15f6-4e57-a040-7c4e9a7152a9')::TEXT as "Enc.Vitamin A given",
         programEncounter.observations ->>
         '3a751617-2cc6-40f7-a045-dab175c363dc'::TEXT                                        as "Enc.Other place of delivery",
         programEncounter.observations ->>
         'b4d6b6b6-fff0-4dda-8f60-aa273ff20250'::TEXT                                        as "Enc.Date of discharge",
         single_select_coded(
               programEncounter.observations ->> 'a0405799-1e3c-40ef-90ba-84c9c0931660')::TEXT as "Enc.Place of delivery",
         single_select_coded(
               programEncounter.observations ->> '58b6367a-825f-43e2-b6b7-b35a5cbc3a09')::TEXT as "Enc.Delivered by",
         programEncounter.observations ->>
         '842b3382-09ce-4c9f-ba5e-20b5a6c1086a'::TEXT                                        as "Enc.Other reason to have birth at home",
         single_select_coded(
               programEncounter.observations ->> '59086cb8-f1cd-4f2a-bb78-accb03fe301a')::TEXT as "Enc.Received JSY",
         programEncounter.observations ->>
         'bc7c8d69-596b-4607-b858-41c500a5a3cf'::TEXT                                        as "Enc.Labour time",
         multi_select_coded(
               programEncounter.observations -> 'c41b67c4-62be-4ea4-9064-6a188777407e')::TEXT  as "Enc.Reason to have birth at home",
         programEncounter.observations ->>
         'f66b51a3-c0ad-4e40-a5ee-eca2481bd83c'::TEXT                                        as "Enc.Date of delivery",
         single_select_coded(
               programEncounter.observations ->> '0c26df89-e22e-4ea6-a20b-280d0b431774')::TEXT as "Enc.Gender of new born1",
         multi_select_coded(
               programEncounter.observations -> '42fcfd17-4e35-4981-96b3-1d028915d808')::TEXT  as "Enc.Delivery Complications",
         programEncounter.observations ->>
         '884cd2fb-1e50-4a2e-a9ae-2b90d4a78ede'::TEXT                                        as "Enc.Number of babies",
         programEncounter.observations ->>
         'cae75c6e-4611-49a0-8356-be1fa12ceba9'::TEXT                                        as "Enc.Other delivery complications",
         single_select_coded(
               programEncounter.observations ->> '69d0acf1-c32b-4694-9bc2-874b5e7a44c8')::TEXT as "Enc.Type of delivery",
         single_select_coded(
               programEncounter.observations ->> '7804e278-e352-4c85-a3f1-12ff97ac1d6b')::TEXT as "Enc.Gender of new born2",
         single_select_coded(
               programEncounter.observations ->> '49c5461d-1103-4b17-bc80-6bc502db2558')::TEXT as "Enc.Gender of new born3",
         single_select_coded(
               programEncounter.observations ->> '36b7b1a8-d191-4bbe-ad3c-0e25a48334e0')::TEXT as "Enc.Delivery outcome",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time"

  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = '61383d58-82b4-44fb-96d0-6449f0e68c1b'
    AND oet.uuid = '9b4fa8ec-fd62-487a-aa35-8f74f3c20db2'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);

drop view if exists ck_mother_abortion;
create view ck_mother_abortion as (
  SELECT individual.id                                                                                          "Ind.Id",
         individual.address_id                                                                                  "Ind.address_id",
         individual.uuid                                                                                        "Ind.uuid",
         individual.first_name                                                                                  "Ind.first_name",
         individual.last_name                                                                                   "Ind.last_name",
         g.name                                                                                                 "Ind.Gender",
         individual.date_of_birth                                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                                           "Ind.registration_date",
         individual.facility_id                                                                                 "Ind.facility_id",
         a.title                                                                                                "Ind.Area",
         c2.name                                                                                                "Ind.Catchment",
         individual.is_voided                                                                                   "Ind.is_voided",
         op.name                                                                                                "Enl.Program Name",
         programEnrolment.id                                                                                    "Enl.Id",
         programEnrolment.uuid                                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                                             "Enl.is_voided",
         oet.name                                                                                               "Enc.Type",
         programEncounter.id                                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                                  "Enc.uuid",
         programEncounter.name                                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT                        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT                       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT                        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT                        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT                       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT                       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '2d679fd5-a75b-46bd-96c2-10c180187342'::TEXT                                                        as "Enl.Parity",
         programEnrolment.observations ->>
         'd924596e-e08e-4829-b4c3-77a0411d18c7'::TEXT                                                        as "Enl.Number of female children",
         programEnrolment.observations ->>
         '1b749b48-bfae-470d-8219-a735dae99f7a'::TEXT                                                        as "Enl.Number of male children",
         programEnrolment.observations ->>
         '305f693c-c8b6-4e3e-9a82-a6e91a3e462f'::TEXT                                                        as "Enl.Age of youngest child",
         single_select_coded(
               programEnrolment.observations ->> 'b47dca1d-3f42-4280-9b3e-3d68cce88bed')::TEXT                 as "Enl.Is she on TB medication?",
         single_select_coded(
               programEnrolment.observations ->> '4a20f69f-12c4-4472-ac82-ece0ab102e4b')::TEXT                 as "Enl.Did she complete her TB treatment?",
         single_select_coded(
               programEnrolment.observations ->> '2a8a5306-c0a9-4ca6-8bd7-b394069aa6f2')::TEXT                 as "Enl.Has she been taking her TB medication regularly?",
         programEnrolment.observations ->>
         'e638d96b-ad09-4fec-9e01-2e4b1a243c6d'::TEXT                                                        as "Enl.Date of deworming",
         programEnrolment.observations ->>
         'f91604a8-89ac-4a99-a3cb-9edd764c8b0e'::TEXT                                                        as "Enl.TT1 Date",
         programEnrolment.observations ->>
         'e1b7ce95-8c73-46fa-8354-19a14f5ca17f'::TEXT                                                        as "Enl.TT Booster Date",
         programEnrolment.observations ->>
         '57f66ff5-e050-4a72-ad03-94d99dad4630'::TEXT                                                        as "Enl.TT2 Date",
         programEnrolment.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                                        as "Enl.Height",
         programEnrolment.observations ->>
         '1cc6fd5d-1359-483e-a971-4bf36e34a72d'::TEXT                                                        as "Enl.Last menstrual period",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                                        as "Enl.Weight",
         programEnrolment.observations ->>
         'dde911fa-15eb-4564-8deb-bba46e9d3744'::TEXT                                                        as "Enl.Estimated Date of Delivery",
         programEnrolment.observations ->>
         '7ac0d759-c50d-4971-88e0-84274224c839'::TEXT                                                        as "Enl.BMI",
         programEnrolment.observations ->>
         '73a3fdd7-3087-4d53-b8be-753e2cdfa6c2'::TEXT                                                        as "Enl.Service commitment number",
         single_select_coded(
               programEnrolment.observations ->> 'e0c80ed9-908c-4c93-b3e2-56ac0dfa7087')::TEXT                 as "Enl.Service commitment type",
         multi_select_coded(
               programEnrolment.observations -> '18fa9773-bf4b-47f8-9535-f1573a477940')::TEXT                  as "Enl.Family history",
         programEnrolment.observations ->>
         '2ea977b5-23cb-4833-a5ca-831b12409e41'::TEXT                                                        as "Enl.Other family history",
         programEnrolment.observations ->>
         '7d34125a-1b0b-4755-acc8-aeda71af8bd3'::TEXT                                                        as "Enl.Other obstetrics history",
         multi_select_coded(
               programEnrolment.observations -> '8a4ab436-6767-45d5-95d7-075d9459609e')::TEXT                  as "Enl.Obstetrics history",
         programEnrolment.observations ->>
         'b3e9c088-90ed-45d9-8c99-102d1bda66e1'::TEXT                                                        as "Enl.Number of living children",
         programEnrolment.observations ->>
         '73037237-15b7-43ba-b375-2a34af9cc1f5'::TEXT                                                        as "Enl.Age at first pregnancy",
         programEnrolment.observations ->>
         '38b9986b-76e8-4015-ae51-48152b1cd42c'::TEXT                                                        as "Enl.Number of abortions",
         programEnrolment.observations ->>
         'd7ae1329-9e09-47f1-ad7d-3c73474d973f'::TEXT                                                        as "Enl.Number of child deaths",
         single_select_coded(
               programEnrolment.observations ->> 'c357b704-49e2-4c4b-a153-21b8867c152b')::TEXT                 as "Enl.Is this your first pregnancy?",
         programEnrolment.observations ->>
         '74de4054-0e8b-4088-aae8-bd5f2933d300'::TEXT                                                        as "Enl.Number of stillbirths",
         programEnrolment.observations ->>
         'dc2c23e9-19ad-471f-81d1-213069ccc975'::TEXT                                                        as "Enl.Gravida",
         programEnrolment.observations ->>
         '99c9d0a3-6ffc-41a7-8641-d79e2e83a4c6'::TEXT                                                        as "Enl.Number of miscarriages",
         programEnrolment.observations ->>
         '72f1ecc4-9f6d-4bab-ba01-a11c822bfb5a'::TEXT                                                        as "Enl.General Advice",
         multi_select_coded(
               programEncounter.observations -> 'fc1346b0-57fe-4a84-8d95-f4461d60176f')::TEXT                  as "Enc.Post abortion complaints",
         programEncounter.observations ->>
         'b4d6b6b6-fff0-4dda-8f60-aa273ff20250'::TEXT                                                        as "Enc.Date of discharge",
         programEncounter.observations ->>
         'a7d52633-56ff-486d-b451-b119d74a7760'::TEXT                                                        as "Enc.Other abortion complaints",
         single_select_coded(
               programEncounter.observations ->> '94e3ad45-ae52-41dc-a26a-27b4973cbd04')::TEXT                 as "Enc.Type of Abortion",
         programEncounter.observations ->>
         'c82404a6-78f6-4e55-93b8-51acc5d8aa68'::TEXT                                                        as "Enc.Date of abortion",
         single_select_coded(
               programEncounter.observations ->> 'b8893e96-89fd-4965-93ea-b9307dd69be0')::TEXT                 as "Enc.Place of abortion",
         programEncounter.cancel_date_time                                                                      "EncCancel.cancel_date_time"

  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = '61383d58-82b4-44fb-96d0-6449f0e68c1b'
    AND oet.uuid = 'ec3d643a-6da4-417e-8ee5-2654344f1756'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);

drop view if exists ck_mother_pnc;
create view ck_mother_pnc as (
  SELECT individual.id                                                                          "Ind.Id",
         individual.address_id                                                                  "Ind.address_id",
         individual.uuid                                                                        "Ind.uuid",
         individual.first_name                                                                  "Ind.first_name",
         individual.last_name                                                                   "Ind.last_name",
         g.name                                                                                 "Ind.Gender",
         individual.date_of_birth                                                               "Ind.date_of_birth",
         individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
         individual.registration_date                                                           "Ind.registration_date",
         individual.facility_id                                                                 "Ind.facility_id",
         a.title                                                                                "Ind.Area",
         c2.name                                                                                "Ind.Catchment",
         individual.is_voided                                                                   "Ind.is_voided",
         op.name                                                                                "Enl.Program Name",
         programEnrolment.id                                                                    "Enl.Id",
         programEnrolment.uuid                                                                  "Enl.uuid",
         programEnrolment.is_voided                                                             "Enl.is_voided",
         programEnrolment.enrolment_date_time                                                   "Enl.program_enrolment_date_time",
         programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
         oet.name                                                                               "Enc.Type",
         programEncounter.id                                                                    "Enc.Id",
         programEncounter.earliest_visit_date_time                                              "Enc.earliest_visit_date_time",
         programEncounter.encounter_date_time                                                   "Enc.encounter_date_time",
         programEncounter.program_enrolment_id                                                  "Enc.program_enrolment_id",
         programEncounter.uuid                                                                  "Enc.uuid",
         programEncounter.name                                                                  "Enc.name",
         programEncounter.max_visit_date_time                                                   "Enc.max_visit_date_time",
         programEncounter.is_voided                                                             "Enc.is_voided",
         multi_select_coded(
               individual.observations -> '2ebca9be-3be3-4d11-ada0-187563ff04f8')::TEXT        as "Ind.Addiction Details",
         individual.observations ->>
         'a3d999d4-57f4-40ee-99ab-4f1ee1bd1e1b'::TEXT                                        as "Ind.Medications",
         individual.observations ->>
         'f374fc29-52f5-42cb-964e-b9af65a1d618'::TEXT                                        as "Ind.Room number",
         individual.observations ->>
         '928b4521-98d0-4cb3-a38e-42a775bf814e'::TEXT                                        as "Ind.Alternative contact number",
         individual.observations ->>
         '1d6ac236-2ab4-4eaa-aa3d-e18924d93ba3'::TEXT                                        as "Ind.myCHI Id",
         single_select_coded(
               individual.observations ->> 'dd5b53f1-7508-4be8-aec2-ef782946e0f2')::TEXT       as "Ind.Floor",
         individual.observations ->>
         '07cf0ae9-9738-418f-b1bd-bf69ebd20e3c'::TEXT                                        as "Ind.Street",
         multi_select_coded(
               individual.observations -> '65ed656a-4d9c-4572-a76f-b00e6aa4de72')::TEXT        as "Ind.Individual inactive",
         individual.observations ->>
         '24dabc3a-6562-4521-bd42-5fff11ea5c46'::TEXT                                        as "Ind.Household number",
         individual.observations ->>
         '82fa0dbb-92f9-4ec2-9263-49054e64d909'::TEXT                                        as "Ind.Contact Number",
         individual.observations ->>
         '41c792c1-3038-4baa-a71e-946de3131bc6'::TEXT                                        as "Ind.Drug allergies",
         multi_select_coded(
               individual.observations -> '2991127b-7064-4027-a030-4a3a8d0e8aa7')::TEXT        as "Ind.Medical history",
         single_select_coded(
               individual.observations ->> '3493c80a-8af5-40e6-b598-8385c4db2bd7')::TEXT       as "Ind.Blood group",
         individual.observations ->>
         '331de3bd-7dc6-43ee-a8b8-45ee1d8a8617'::TEXT                                        as "Ind.Other medical history",
         single_select_coded(
               individual.observations ->> '47dec150-90f5-4db4-9ff5-6e96472176d7')::TEXT       as "Ind.Is mother the primary caregiver",
         individual.observations ->>
         '4edb709d-a0ad-44fd-9132-2884054cd114'::TEXT                                        as "Ind.Father/Husband",
         programEnrolment.observations ->>
         '2d679fd5-a75b-46bd-96c2-10c180187342'::TEXT                                        as "Enl.Parity",
         programEnrolment.observations ->>
         'd924596e-e08e-4829-b4c3-77a0411d18c7'::TEXT                                        as "Enl.Number of female children",
         programEnrolment.observations ->>
         '1b749b48-bfae-470d-8219-a735dae99f7a'::TEXT                                        as "Enl.Number of male children",
         programEnrolment.observations ->>
         '305f693c-c8b6-4e3e-9a82-a6e91a3e462f'::TEXT                                        as "Enl.Age of youngest child",
         single_select_coded(
               programEnrolment.observations ->> 'b47dca1d-3f42-4280-9b3e-3d68cce88bed')::TEXT as "Enl.Is she on TB medication?",
         single_select_coded(
               programEnrolment.observations ->> '4a20f69f-12c4-4472-ac82-ece0ab102e4b')::TEXT as "Enl.Did she complete her TB treatment?",
         single_select_coded(
               programEnrolment.observations ->> '2a8a5306-c0a9-4ca6-8bd7-b394069aa6f2')::TEXT as "Enl.Has she been taking her TB medication regularly?",
         programEnrolment.observations ->>
         'e638d96b-ad09-4fec-9e01-2e4b1a243c6d'::TEXT                                        as "Enl.Date of deworming",
         programEnrolment.observations ->>
         'f91604a8-89ac-4a99-a3cb-9edd764c8b0e'::TEXT                                        as "Enl.TT1 Date",
         programEnrolment.observations ->>
         'e1b7ce95-8c73-46fa-8354-19a14f5ca17f'::TEXT                                        as "Enl.TT Booster Date",
         programEnrolment.observations ->>
         '57f66ff5-e050-4a72-ad03-94d99dad4630'::TEXT                                        as "Enl.TT2 Date",
         programEnrolment.observations ->>
         'd883d5fe-e17d-4136-b989-089fa0295e34'::TEXT                                        as "Enl.Height",
         programEnrolment.observations ->>
         '1cc6fd5d-1359-483e-a971-4bf36e34a72d'::TEXT                                        as "Enl.Last menstrual period",
         programEnrolment.observations ->>
         '75b1656e-2777-4753-9612-ce03a766a5e1'::TEXT                                        as "Enl.Weight",
         programEnrolment.observations ->>
         'dde911fa-15eb-4564-8deb-bba46e9d3744'::TEXT                                        as "Enl.Estimated Date of Delivery",
         programEnrolment.observations ->>
         '7ac0d759-c50d-4971-88e0-84274224c839'::TEXT                                        as "Enl.BMI",
         programEnrolment.observations ->>
         '73a3fdd7-3087-4d53-b8be-753e2cdfa6c2'::TEXT                                        as "Enl.Service commitment number",
         single_select_coded(
               programEnrolment.observations ->> 'e0c80ed9-908c-4c93-b3e2-56ac0dfa7087')::TEXT as "Enl.Service commitment type",
         multi_select_coded(
               programEnrolment.observations -> '18fa9773-bf4b-47f8-9535-f1573a477940')::TEXT  as "Enl.Family history",
         programEnrolment.observations ->>
         '2ea977b5-23cb-4833-a5ca-831b12409e41'::TEXT                                        as "Enl.Other family history",
         programEnrolment.observations ->>
         '7d34125a-1b0b-4755-acc8-aeda71af8bd3'::TEXT                                        as "Enl.Other obstetrics history",
         multi_select_coded(
               programEnrolment.observations -> '8a4ab436-6767-45d5-95d7-075d9459609e')::TEXT  as "Enl.Obstetrics history",
         programEnrolment.observations ->>
         'b3e9c088-90ed-45d9-8c99-102d1bda66e1'::TEXT                                        as "Enl.Number of living children",
         programEnrolment.observations ->>
         '73037237-15b7-43ba-b375-2a34af9cc1f5'::TEXT                                        as "Enl.Age at first pregnancy",
         programEnrolment.observations ->>
         '38b9986b-76e8-4015-ae51-48152b1cd42c'::TEXT                                        as "Enl.Number of abortions",
         programEnrolment.observations ->>
         'd7ae1329-9e09-47f1-ad7d-3c73474d973f'::TEXT                                        as "Enl.Number of child deaths",
         single_select_coded(
               programEnrolment.observations ->> 'c357b704-49e2-4c4b-a153-21b8867c152b')::TEXT as "Enl.Is this your first pregnancy?",
         programEnrolment.observations ->>
         '74de4054-0e8b-4088-aae8-bd5f2933d300'::TEXT                                        as "Enl.Number of stillbirths",
         programEnrolment.observations ->>
         'dc2c23e9-19ad-471f-81d1-213069ccc975'::TEXT                                        as "Enl.Gravida",
         programEnrolment.observations ->>
         '99c9d0a3-6ffc-41a7-8641-d79e2e83a4c6'::TEXT                                        as "Enl.Number of miscarriages",
         programEnrolment.observations ->>
         '72f1ecc4-9f6d-4bab-ba01-a11c822bfb5a'::TEXT                                        as "Enl.General Advice",
         programEncounter.observations ->>
         '1e2d41a2-5b6a-4ad7-ab91-51d3cdf122bd'::TEXT                                        as "Enc.Diastolic",
         programEncounter.observations ->>
         'e6edb61c-c3d9-44c8-abf7-4fd09fe39ec9'::TEXT                                        as "Enc.Temperature",
         programEncounter.observations ->>
         '70d617f9-3c14-4ec2-8d0f-97c837f6ab37'::TEXT                                        as "Enc.Respiratory Rate",
         programEncounter.observations ->>
         '2a04bf88-6346-4eda-a86c-8a2afc011b22'::TEXT                                        as "Enc.Systolic",
         programEncounter.observations ->>
         'bf79f9bf-1dc7-4bb5-8747-a9e2ab1e73f3'::TEXT                                        as "Enc.Hb % Level",
         programEncounter.observations ->>
         '2d3b8f90-6123-4dbf-b866-4f56ac7d24c8'::TEXT                                        as "Enc.Pulse",
         multi_select_coded(
               programEncounter.observations -> '863b3d4b-31df-4313-9a20-66749c1f175d')::TEXT  as "Enc.Post-Partum Haemorrhage symptoms",
         programEncounter.observations ->>
         '8cbd5ba9-c6ee-4d27-94ed-280bd88ae990'::TEXT                                        as "Enc.Other breast problems",
         multi_select_coded(
               programEncounter.observations -> '0f01b6f6-b7e3-41ea-8d49-9df23196125b')::TEXT  as "Enc.Any difficulties with urinating",
         programEncounter.observations ->>
         '6f1019e6-91ba-47ae-98f6-4535f9d38a75'::TEXT                                        as "Enc.Other complications",
         single_select_coded(
               programEncounter.observations ->> 'b289dac9-c2fe-4111-babd-502a691fb461')::TEXT as "Enc.Any discharge from wound",
         multi_select_coded(
               programEncounter.observations -> '88fe8286-316d-4ee8-be86-2d8c3840881c')::TEXT  as "Enc.Any breast problems",
         multi_select_coded(
               programEncounter.observations -> 'a70eb606-3155-49f1-b2b4-6bc858ea6d31')::TEXT  as "Enc.How is the incision area",
         single_select_coded(
               programEncounter.observations ->> '75235180-0625-4bb2-9a89-fae17b6a0100')::TEXT as "Enc.Open or loose stitches",
         multi_select_coded(
               programEncounter.observations -> '2de99de4-558c-44b0-9882-abe7d892fe6c')::TEXT  as "Enc.Any abdominal problems",
         multi_select_coded(
               programEncounter.observations -> 'a4b8583b-80af-4a9f-b506-037a7abb1f43')::TEXT  as "Enc.Any vaginal problems",
         single_select_coded(
               programEncounter.observations ->> 'a15faeac-ae32-4acb-aca4-546e0a661fda')::TEXT as "Enc.Feels chill",
         single_select_coded(
               programEncounter.observations ->> '581471f2-fa16-4082-abc8-3c74de7b0561')::TEXT as "Enc.Stitches during delivery",
         single_select_coded(
               programEncounter.observations ->> 'ab9596e4-04b6-48f2-9f4d-1c7a2c82dbf8')::TEXT as "Enc.Convulsions",
         multi_select_coded(
               programEncounter.observations -> '0776992a-78de-4bd1-bfcb-f63ff1f7630e')::TEXT  as "Enc.Post-Partum Depression Symptoms",
         single_select_coded(
               programEncounter.observations ->> '690af7fc-50d1-4a38-a864-58219ee14da6')::TEXT as "Enc.Feels hot",
         multi_select_coded(
               programEncounter.observations -> 'bc8a4300-6a51-411f-a81b-198135fdf236')::TEXT  as "Enc.Reason for eating less than pre-pregnancy",
         multi_select_coded(
               programEncounter.observations -> '370721b6-7d28-4993-b408-9266e408b5a1')::TEXT  as "Enc.Calcium tablets received from",
         programEncounter.observations ->>
         '0dcf9cee-b2c7-4751-86a2-142fd924068f'::TEXT                                        as "Enc.How many IFA tablets mother consumed since last visit?",
         single_select_coded(
               programEncounter.observations ->> 'bd925c49-1315-405a-999b-cd6509668281')::TEXT as "Enc.Eating compared to your pre-pregnancy food intake",
         programEncounter.observations ->>
         '70cad8f7-722e-4186-aa89-4acc7acb2ed7'::TEXT                                        as "Enc.Other reason for eating less than pre-pregnancy",
         single_select_coded(
               programEncounter.observations ->> 'd60670cb-becd-4a25-b854-14f9e7e60add')::TEXT as "Enc.Is mother drinking at least one glass of milk per day?",
         multi_select_coded(
               programEncounter.observations -> 'aa9462ca-9312-41df-8a92-741d81f77ee7')::TEXT  as "Enc.Where does mother get IFA tablets from?",
         programEncounter.observations ->>
         'c2b21d7d-447a-4f97-9775-199c316921e4'::TEXT                                        as "Enc.Number of calcium tablets consumed since last last visit",
         programEncounter.cancel_date_time                                                      "EncCancel.cancel_date_time",
         programEncounter.cancel_observations ->>
         'f23251e2-68c6-447b-84c2-285d61e95f0f'::TEXT                                        as "EncCancel.Other reason for cancelling",
         single_select_coded(programEncounter.cancel_observations ->>
                             '739f9a56-c02c-4f81-927b-69842d78c1e8')::TEXT                   as "EncCancel.Visit cancel reason"
  FROM program_encounter programEncounter
         LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
         LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
         LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
  WHERE c2.name not ilike '%master%'
    AND op.uuid = '61383d58-82b4-44fb-96d0-6449f0e68c1b'
    AND oet.uuid = 'f30945dd-7768-4a7e-bce9-2c96a6834373'
    AND programEncounter.encounter_date_time IS NOT NULL
    AND programEnrolment.enrolment_date_time IS NOT NULL
);


-- ----------------------------------------------------

set role none;
