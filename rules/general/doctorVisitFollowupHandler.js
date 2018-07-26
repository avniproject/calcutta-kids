const { FormElementStatusBuilder, SkipLogic } = require('rules-config/rules');
const { when, show, contains, is: equals, buildAndExport } = SkipLogic;

const pregnancyTestResultFunc = (programEncounter, formElement) => {
    const pregnancyTestObs = programEncounter.findLatestObservationInEntireEnrolment('Pregnancy test', programEncounter);
    return pregnancyTestObs && pregnancyTestObs.getReadableValue();
};

const filters = {
    formUuid: 'db80ea16-8538-41ca-bd6a-53abc9be088b',
    uuid: 'd54dafdf-34d7-44ac-b0ca-8071486a48e9',
    name: 'Doctor Visit Followup at Home form rules',
    execOrder: 100.0,
    otherData: {},
    // cached: [pregnancyTestResultFunc]
};

filters.rules = [
    when('Is patient taking medicines as prescribed?', contains('SOME of the prescribed medicines'))
        .show('whyIsThePatientTakingOnlySomeOfThePrescribedMedicines',
            'forAllMedicinesThePatientIsTakingIsThePatientTakingTheMedicineCorrectlyCheckYesIfPatientIsTakingTheCorrectDoseAndCompletingTheFullCourseOfTheMedicine'),
    when('Reasons for patient taking only some of the prescribed medicines', contains('Other'))
        .show('Other reasons for taking only some prescribed medicines'),
    when('Does patient take correct dose of medicine and complete course fully?', contains('No'))
        .show('In what way is the patient taking their medicine incorrectly? (Please encourage patient to take their medicine correctly)'),
    when('Does patient takes medicines other than the prescribed medicine?', contains('Yes'))
        .show('namesOfNonPrescribedMedicinesBeingTaken'),
    when('Was patient referred to the hospital during their visit to clinic?', contains('Yes'))
        .show('whyWasThePatientReferredToTheHospital',
            'didPatientTakeReferralAdviceAndGoToHospital'),
    when(pregnancyTestResultFunc, equals('Positive'))
        .show('doYouWantToKeepYourChild'),
    when(pregnancyTestResultFunc, equals('Positive'))
        .and(when('Do you want to keep your child?', contains('Yes')))
        .show('Encourage woman to register her pregnancy in office'),
    when(pregnancyTestResultFunc, equals('Positive'))
        .and(when('Do you want to keep your child?', contains('No')))
        .show('doYouPlanToGoToAHospitalToPursueAnAbortion'),
    when(pregnancyTestResultFunc, equals('Positive'))
        .and(when('Do you plan to go to a hospital to pursue an abortion?', contains('No')))
        .show('counselAgainstHomeAbortionKitsAndEncourageToVisitTheHospitalForAnAbortion')
];
filters.directFunctions = {
    patientDidntGoToHospitalAsPerReferralAdviceBecause(programEncounter, formElement) {
        const statusBuilder = new FormElementStatusBuilder({ programEncounter, formElement });
        statusBuilder.show().when.valueInEncounter('Did patient take referral advice and go to hospital?').is.no;
        return statusBuilder.build();
    }
}

buildAndExport(filters, exports);
// exports[DecisionsClass] = DecisionsClass;