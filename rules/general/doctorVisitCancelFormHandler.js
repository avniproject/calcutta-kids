import {
    FormElementsStatusHelper,
    FormElementStatus,
    FormElementStatusBuilder,
    RuleFactory,
    StatusBuilderAnnotationFactory,
    VisitScheduleBuilder
} from 'rules-config/rules';

const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');
const CancelViewFilter = RuleFactory("0f72e14f-15c6-4293-b47c-af96b2fb7a79", "ViewFilter");

@CancelViewFilter("b604f50d-3a0f-42ce-a18a-7e6d6acf014e", "CK Doctor visit followup at home cancel view filter", 100.0, {})
class DoctorVisitAtHomeCancellationViewFilterHandlerCK {


    otherPleaseSpecify(programEncounter, formElement) {
        const cancelReasonObs = programEncounter.findCancelEncounterObservation('Doctor visit follow up at home cancel reason');
        const answer = cancelReasonObs && cancelReasonObs.getReadableValue();
        return new FormElementStatus(formElement.uuid, answer === 'Other');
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DoctorVisitAtHomeCancellationViewFilterHandlerCK(), programEncounter, formElementGroup, today);
    }
}

export {
    DoctorVisitAtHomeCancellationViewFilterHandlerCK
}
