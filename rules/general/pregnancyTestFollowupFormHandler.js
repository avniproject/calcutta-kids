const { RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper } = require('rules-config/rules');

const PregnancyTestFollowupFormFilter = RuleFactory("c5e2244d-8f9a-4120-a410-2be9cabab605", 'ViewFilter');
const RuleHelper = require('../RuleHelper');

@PregnancyTestFollowupFormFilter('2903d14d-04c7-4d7d-a4c4-9306525af0a2', 'Skip logic for Pregnancy Test Followup form', 100.0)
class PregnancyTestFollowupFormHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new PregnancyTestFollowupFormHandler(), programEncounter, formElementGroup, today);
    }

    doYouWantToKeepYourChild(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Pregnancy test status', 'Positive');
    }

    encourageWomanToRegisterHerPregnancyInOffice(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Do you want to keep your child?', 'Yes');
    }

    doYouPlanToGoToAHospitalToPursueAnAbortion(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Do you want to keep your child?', 'No');
    }

    counselAgainstHomeAbortionKitsAndEncourageToVisitTheHospitalForAnAbortion(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Do you plan to go to a hospital to pursue an abortion?', 'No');
    }
}

module.exports = PregnancyTestFollowupFormHandler;
