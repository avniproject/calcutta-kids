const rulesConfigInfra = require('rules-config/infra');
const IDI = require('openchs-idi');
const secrets = require('../secrets.json');

module.exports = IDI.configure({
    "name": "calcutta_kids",
    "chs-admin": "admin",
    "org-name": "Calcutta Kids",
    "org-admin": "ck-admin",
    "secrets": secrets,
    "files": {
        "adminUsers": {
            "dev": ["./users/admin-user.json"],
        },
        "forms": [
            "./registrationForm.json",
            "./sesForm.json",
            "./general/doctorVisitFollowupForm.json",
            "./general/doctorVisitForm.json",
            "./child/checklistForm.json",
            "./child/childHomeVisit.json",
            "./child/pncDoctorCheckup.json",
            "./pregnancy/ancHomeVisitForm.json",
            "./pregnancy/postAbortionForm.json",
            "./pregnancy/ancGMP.json",
            "./mother/motherHomeVisitForm.json",
            "./mother/motherProgramEnrolmentNullForm.json",
        ],
        "formMappings": ["./formMappings.json"],
        "formDeletions": [
            "./child/anthroAssessmentFormDeletions.json",
            "./child/birthFormDeletions.json",
            "./child/pncDeletions.json",
            "./general/labTestsDeletions.json",
            "./pregnancy/abortionDeletions.json",
            "./pregnancy/ancDoctorVisitFormDeletions.json",
            "./pregnancy/enrolmentDeletions.json",
            "./pregnancy/motherDeliveryFormDeletions.json",
            "./pregnancy/pncDeletions.json",
        ],
        "formAdditions": [
            "./child/anthroAssessmentFormAdditions.json",
            "./child/birthFormAdditions.json",
            "./child/enrolmentAdditions.json",
            "./child/pncAdditions.json",
            "./general/labTestsAdditions.json",
            "./pregnancy/ancDoctorVisitFormAdditions.json",
            "./pregnancy/enrolmentAdditions.json",
            "./pregnancy/motherDeliveryFormAdditions.json",
            "./pregnancy/pncAdditions.json",
        ],
        "catchments": ["./catchments.json"],
        "checklistDetails": ["./child/checklist.json"],
        "concepts": [
            "./concepts.json",
            "./child/checklistConcepts.json",
            "./child/enrolmentConcepts.json",
            "./child/homeVisitConcepts.json",
            "./child/pncConcepts.json",
            "./doctorVisitConcepts.json",
            "./pregnancy/ancDoctorVisitConcepts.json",
            "./pregnancy/ancHomeVisitConcepts.json",
            "./pregnancy/deliveryConcepts.json",
            "./pregnancy/pncConcepts.json",
            "./pregnancy/pregnancyConcepts.json",
            "./migrationConcepts.json",
            //"./patchConcepts.json",
        ],
        "addressLevelTypes": ["./addressLevelTypes.json"],
        "locations": ["./locations.json"],
        "programs": ["./programs.json"],
        "encounterTypes": ["./encounterTypes.json"],
        "operationalEncounterTypes": ["operationalModules/operationalEncounterTypes.json"],
        "operationalPrograms": ["operationalModules/operationalPrograms.json"],
        "operationalSubjectTypes": ["operationalSubjectTypes.json"],
        "users": {
            "dev": ["./users/test-users.json"],
            // "prod": ["./users/importer-user.json"],
        },
        "rules": [
            "./rules/index.js"
        ],
        "organisationSql": [
            /* "create_organisation.sql"*/
        ]
    }
}, rulesConfigInfra);
