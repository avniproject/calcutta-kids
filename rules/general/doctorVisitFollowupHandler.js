const { RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper } = require('rules-config/rules');

const DoctorVisitFollowupFilter = RuleFactory("db80ea16-8538-41ca-bd6a-53abc9be088b", "ViewFilter");

class DoctorVisitFollowupHandler {
    whyIsThePatientTakingOnlySomeOfThePrescribedMedicines(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Is patient taking medicines as prescribed?")
            .containsAnswerConceptName("SOME of the prescribed medicines")
            .or.containsAnswerConceptName("NONE of the prescribed medicines")
            .or.containsAnswerConceptName("NA");
        return statusBuilder.build();
    }

    otherReasonsForTakingOnlySomePrescribedMedicines(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Reasons for patient taking only some of the prescribed medicines")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    inWhatWayIsThePatientTakingTheirMedicineIncorrectlyPleaseEncouragePatientToTakeTheirMedicineCorrectly(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Does patient take correct dose of medicine and complete course fully?")
            .containsAnswerConceptName("No");
        return statusBuilder.build();
    }

    namesOfNonPrescribedMedicinesBeingTaken(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Does patient takes medicines other than the prescribed medicine?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    whyWasThePatientReferredToTheHospital(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Was patient referred to the hospital during their visit to clinic?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    didPatientTakeReferralAdviceAndGoToHospital(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Was patient referred to the hospital during their visit to clinic?")
            .containsAnswerConceptName("Yes");
        return statusBuilder.build();
    }

    patientDidntGoToHospitalAsPerReferralAdviceBecause(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Did patient take referral advice and go to hospital?")
            .containsAnswerConceptName("No");
        return statusBuilder.build();
    }
}


@DoctorVisitFollowupFilter("d54dafdf-34d7-44ac-b0ca-8071486a48e9", "Doctor Visit Followup form rules", 100.0, {})
class DoctorVisitFollowupFormRules {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DoctorVisitFollowupHandler(), programEncounter, formElementGroup, today);
    }
}

module.exports = DoctorVisitFollowupFormRules;