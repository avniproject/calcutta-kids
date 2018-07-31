const moment = require('moment');
import {StatusBuilderAnnotationFactory, RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder as ComplicationsBuilder, FormElementStatus} from 'rules-config/rules';

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

    @WithStatusBuilder
    otherPregnancyComplications([programEncounter, formElement], statusBuilder) {
        statusBuilder.show().when.valueInEncounter('Pregnancy complications').containsAnyAnswerConceptName('Other');
    }

    height(programEncounter, formElement){
        let value = programEncounter.programEnrolment.getObservationReadableValue("Height");
        let status = new FormElementStatus(formElement.uuid, true, value);
        return status;
    }

    @WithStatusBuilder
    gestationalAge([programEncounter], statusBuilder) {
        // // it does not work because of a product bug.
        // // user have to edit 'Gestational Age' field to see the field getting auto updated.
        // // Before first edit it does not update the field.
        // // After first edit whatever you do, you cannot change the value in the form.
        // // To understand more uncomment deploy and see it yourself.

        // const lmp = programEncounter.programEnrolment.getObservationValue('Last menstrual period');
        // const td = _.get(programEncounter, "encounterDateTime", new Date());
        
        // const status = statusBuilder.build();
        // status.value = FormElementsStatusHelper.weeksBetween(td, lmp);
        // return status;
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper.getFormElementsStatusesWithoutDefaults(new ANCDoctorVisitAbdominalExamination(), programEncounter, formElementGroup, today)
    }
}

const ANCDoctorVisitDecision = RuleFactory("3a95e9b0-731a-4714-ae7c-10e1d03cebfe", "Decision");

@ANCDoctorVisitDecision("2710ffc6-7c71-4da3-a606-799ca9227697", "ANC Doctor Visit Decision", 100.0, {})
class ANCDoctorVisitRemoveAllDecisions {
    static exec(programEncounter, decisions, context, today) {
        decisions = {
            "enrolmentDecisions": [],
            "encounterDecisions": [],
            "registrationDecisions": []
        };
        if (programEncounter.encounterType.name === 'ANC')
            this.determineDurationOfPregnancy(programEncounter, decisions['enrolmentDecisions']);
        return decisions;
    }

    static determineDurationOfPregnancy(programEncounter, enrolmentDecisions) {
        let estimatedGestationalAge = programEncounter.getObservationReadableValue('Gestational age');
        if (!_.isNil(estimatedGestationalAge)) {
            let edd = moment(programEncounter.encounterDateTime).add(40 - estimatedGestationalAge, 'weeks');
            enrolmentDecisions.push({name: "Estimated Date of Delivery", value: edd.toDate()});
        }
    }
}

module.exports = {ANCDoctorVisitAbdominalExamination, ANCDoctorVisitRemoveAllDecisions};