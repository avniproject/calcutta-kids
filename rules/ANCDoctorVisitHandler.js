import {StatusBuilderAnnotationFactory, RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder as ComplicationsBuilder} from 'rules-config/rules';

const ANCDoctorVisitFilter = RuleFactory("3a95e9b0-731a-4714-ae7c-10e1d03cebfe", "ViewFilter");
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@ANCDoctorVisitFilter("6b231cf9-6cae-49ef-8fdf-9a24e46b4cff", "ANC Doctor Visit Per Abdominal Examination", 100.0, {})
class ANCDoctorVisitAbdominalExamination {

    @WithStatusBuilder
    fundalHeight([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    @WithStatusBuilder
    fundalHeightFromPubicSymphysis([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    @WithStatusBuilder
    abdominalGirth([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    @WithStatusBuilder
    foetalMovements([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    @WithStatusBuilder
    foetalHeartSound([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    @WithStatusBuilder
    foetalHeartRate([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().whenItem(true).is.truthy;
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper.getFormElementsStatuses(new ANCDoctorVisitAbdominalExamination(), programEncounter, formElementGroup, today)
    }
}

module.exports = {ANCDoctorVisitAbdominalExamination};