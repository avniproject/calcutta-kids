const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const filter = RuleFactory('5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99', 'ViewFilter');
const RuleHelper = require('./RuleHelper');

const TRIMESTER_MAPPING = new Map([[1, {from: 0, to: 12}], [2, {from: 13, to: 28}], [3, {from: 29, to: 40}]]);

@filter('9fb619f0-bf38-46fb-84db-b64f0574f5b0', 'Skip logic for ANCHomeVisit', 1, {})
class ANCHomeVisitFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ANCHomeVisitFilterHandler(), programEncounter, formElementGroup, today);
    }

    static gestationalAge(enrolment, toDate = new Date()) {
        FormElementsStatusHelper.weeksBetween(toDate, enrolment.getObservationValue("Last menstrual period"));
    }

    static currentTrimester(enrolment, toDate = new Date()) {
        [...TRIMESTER_MAPPING.keys()]
            .find((trimester) =>
                ANCHomeVisitFilterHandler.gestationalAge(enrolment, toDate) <= TRIMESTER_MAPPING.get(trimester).to &&
                ANCHomeVisitFilterHandler.gestationalAge(enrolment, toDate) >= TRIMESTER_MAPPING.get(trimester).from);
    }

    constructor() {
        this.haveYouFeltAnyDecreasedFetalMovementOrNoFetalMovement = (programEncounter, formElement) => {
            return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
        };
        this.whenDidTheMovementStopOrDecrease = (programEncounter, formElement) => {
            const currentTrimester = ANCHomeVisitFilterHandler.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
            let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});

            if (currentTrimester < 2) {
                statusBuilder.show().whenItem(false).is.truthy;
            } else {
                statusBuilder.show().when.valueInEncounter('Foetal movements').containsAnswerConceptName('Reduced').or.when.valueInEncounter('Foetal movements').containsAnswerConceptName('Absent');
            }
            return statusBuilder.build();
        };
        this.whatIsTheNameOfTheInstitution = (programEncounter, formElement) => {
            return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Name of institution', 'Yes');
        };
        this.whyEatingSameOrLessCounselAccordingly = (programEncounter, formElement) => {
            return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Eating compared to your pre-pregnancy food intake', 'More');
        };
        this.reasonForRestingLessThan2Hours = (programEncounter, formElement) => {
            let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
            return statusBuilder.show().when.valueInEncounter('Hours of rest yesterday').lessThan(2).build();
        };
        this.reasonForSomeOrMoreManualLabour = (programEncounter, formElement) => {
            return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Manual labour being done compared to pre-pregnancy', 'Less');
        };
        this.reasonForNotSavingMoney = (programEncounter, formElement) => {
            return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Saving money for delivery', 'Yes');
        };
        this.fromWhereDoYouGetYourCalciumTablets = (programEncounter, formElement) => {
            return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
        };
        this.howManyCalciumTabletsHaveYouConsumedSinceYourLastVisit = (programEncounter, formElement) => {
            return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
        };
        this.ancDiscussionItem2 = (programEncounter, formElement) => {
            return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
        };
        this.ancDiscussionItem3 = (programEncounter, formElement) => {
            return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
        };
    }

    static afterTrimester(programEncounter, formElement, trimesterNumber) {
        const currentTrimester = ANCHomeVisitFilterHandler.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().whenItem(currentTrimester).greaterThan(trimesterNumber);
        return statusBuilder.build();
    }
}

module.exports = ANCHomeVisitFilterHandler;