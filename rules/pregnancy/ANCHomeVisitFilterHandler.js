const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const filter = RuleFactory('5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99', 'ViewFilter');
const RuleHelper = require('../RuleHelper');

const TRIMESTER_MAPPING = new Map([[1, {from: 0, to: 12}], [2, {from: 13, to: 28}], [3, {from: 29, to: 40}]]);

@filter('9fb619f0-bf38-46fb-84db-b64f0574f5b0', 'Skip logic for ANCHomeVisit', 1, {})
class ANCHomeVisitFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ANCHomeVisitFilterHandler(), programEncounter, formElementGroup, today);
    }

    static gestationalAge(enrolment, toDate = new Date()) {
        return FormElementsStatusHelper.weeksBetween(toDate, enrolment.getObservationValue("Last menstrual period"));
    }

    static currentTrimester(enrolment, toDate = new Date()) {
        return [...TRIMESTER_MAPPING.keys()]
            .find((trimester) =>
                ANCHomeVisitFilterHandler.gestationalAge(enrolment, toDate) <= TRIMESTER_MAPPING.get(trimester).to &&
                ANCHomeVisitFilterHandler.gestationalAge(enrolment, toDate) >= TRIMESTER_MAPPING.get(trimester).from);
    }
    
    static afterTrimester(programEncounter, formElement, trimesterNumber) {
        const currentTrimester = ANCHomeVisitFilterHandler.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().whenItem(currentTrimester).greaterThan(trimesterNumber);
        return statusBuilder.build();
    }

    haveYouFeltAnyDecreasedFetalMovementOrNoFetalMovement(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
    }

    whenDidTheMovementStopOrDecrease(programEncounter, formElement) {
        const currentTrimester = ANCHomeVisitFilterHandler.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});

        if (currentTrimester < 2) {
            statusBuilder.show().whenItem(false).is.truthy;
        } else {
            statusBuilder.show().when.valueInEncounter('Foetal movements').containsAnyAnswerConceptName('Reduced', 'Absent');
        }
        return statusBuilder.build();
    }

    whatIsTheNameOfTheInstitution(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Registered for institutional delivery', 'Yes');
    }

    otherServicesReceivedOutside(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Services received outside or at Calcutta Kids', 'Other');
    }

    // Eating less
    whyEatingSameOrLessCounselAccordingly(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Eating compared to your pre-pregnancy food intake', 'Less', 'Same');
    }
    otherReasonForEatingSameOrLess(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for eating less than pre-pregnancy', 'Other');
    }

    // Resting
    reasonForRestingLessThan2Hours(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter('Hours of rest yesterday').lessThan(2);
        return statusBuilder.build();
    }
    reasonForRestingLessThan2Hours(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for resting less than 2 hours', 'Other');
    }

    // Manual Labour
    reasonForSomeOrMoreManualLabour(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Manual labour being done compared to pre-pregnancy', 'Some', 'More');
    }
    otherReasonForManualLabour(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for same or more manual labour', 'Other');
    }

    // Saving money
    reasonForNotSavingMoney(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Saving money for delivery', 'No');
    }
    otherReasonForNotSavingMoney(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for not saving money', 'Other');
    }

    // Calcium tablets
    fromWhereDoYouGetYourCalciumTablets(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
    }
    howManyCalciumTabletsHaveYouConsumedSinceYourLastVisit(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
    }

    ancDiscussionItem2(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
    }
    ancDiscussionItem3(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
    }
}

module.exports = ANCHomeVisitFilterHandler;