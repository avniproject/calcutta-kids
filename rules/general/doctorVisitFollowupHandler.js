import {
    FormElementsStatusHelper,
    RuleFactory,
    StatusBuilderAnnotationFactory,
    WithName,
} from 'rules-config/rules';

const FPServicesViewFilter = RuleFactory("db80ea16-8538-41ca-bd6a-53abc9be088b", "ViewFilter");
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

const pregnancyTestResultFunc = (programEncounter, formElement) => {
    const pregnancyTestObs = programEncounter.findLatestObservationInEntireEnrolment('Pregnancy test', programEncounter);
    return pregnancyTestObs && pregnancyTestObs.getReadableValue();
};

@FPServicesViewFilter("b7d4c642-1fe9-424d-a302-127847482f85", "Doctor Visit Followup Handler", 100.0, {})
class DoctorVisitFollowupHandlerCK {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DoctorVisitFollowupHandlerCK(), programEncounter, formElementGroup, today);
    }

    @WithName("Why is the patient taking only some of the prescribed medicines?")
    @WithStatusBuilder
    abc1([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Patient taking medicines as prescribed").containsAnswerConceptName("SOME of the prescribed medicines");
    }

    @WithName("For all medicines the patient is taking, is the patient taking the medicine correctly? (Check yes if patient is taking the correct dose and completing the full course of the medicine)")
    @WithStatusBuilder
    abc12([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Patient taking medicines as prescribed").containsAnswerConceptName("SOME of the prescribed medicines");
    }

    @WithName("Other reasons for taking only some prescribed medicines")
    @WithStatusBuilder
    abc2([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Why is the patient taking only some of the prescribed medicines?").containsAnswerConceptName("Other");
    }

    @WithName("In what way is the patient taking their medicine incorrectly? (Please encourage patient to take their medicine correctly)")
    @WithStatusBuilder
    abc3([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Patient taking correct dose of medicine and completing course fully").containsAnswerConceptName("No");
    }

    @WithName("Names of non prescribed medicines being taken")
    @WithStatusBuilder
    abc4([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Patient taking other than prescribed medicines").containsAnswerConceptName("Yes");
    }

    @WithName("Why was the patient referred to the hospital?")
    @WithStatusBuilder
    abc5([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Was patient referred to the hospital during their visit to clinic?").containsAnswerConceptName("Yes");
    }

    @WithName("Did patient take referral advice and go to hospital?")
    @WithStatusBuilder
    abc6([programEncounter], statusBuilder) {
        statusBuilder.show().when.valueInEncounter("Was patient referred to the hospital during their visit to clinic?").containsAnswerConceptName("Yes");
    }

    @WithName("Do you want to keep your child?")
    @WithStatusBuilder
    abc7([programEncounter], statusBuilder) {
        statusBuilder.show().whenItem(pregnancyTestResultFunc(programEncounter) === 'Positive').is.truthy;
    }

    @WithName("Encourage woman to register her pregnancy in office")
    @WithStatusBuilder
    abc8([programEncounter], statusBuilder) {
        statusBuilder.show().whenItem(pregnancyTestResultFunc(programEncounter) === 'Positive').is.truthy
            .and.when.valueInEncounter("Do you want to keep your child?").containsAnswerConceptName("Yes");
    }

    @WithName("Do you plan to go to a hospital to pursue an abortion?")
    @WithStatusBuilder
    abc9([programEncounter], statusBuilder) {
        statusBuilder.show().whenItem(pregnancyTestResultFunc(programEncounter) === 'Positive').is.truthy
            .and.when.valueInEncounter("Do you want to keep your child?").containsAnswerConceptName("No");
    }

    @WithName("Counsel against home abortion kits and encourage to visit the hospital for an abortion")
    @WithStatusBuilder
    abc10([programEncounter], statusBuilder) {
        statusBuilder.show().whenItem(pregnancyTestResultFunc(programEncounter) === 'Positive').is.truthy
            .and.when.valueInEncounter("Do you plan to go to a hospital to pursue an abortion?").containsAnswerConceptName("No");
    }
}


module.exports = {DoctorVisitFollowupHandlerCK};