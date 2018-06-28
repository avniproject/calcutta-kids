const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} = require('rules-config/rules');
const filter = RuleFactory('5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99', 'ViewFilter');
const RuleHelper = require('RuleHelper');

@filter('9fb619f0-bf38-46fb-84db-b64f0574f5b0', 'Skip logic for ANCHomeVisit')
class ANCHomeVisitFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ANCHomeVisitFilterHandler(), programEncounter, formElementGroup, today);
    }

    constructor() {
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

    }
}

module.exports = ANCHomeVisitFilterHandler;