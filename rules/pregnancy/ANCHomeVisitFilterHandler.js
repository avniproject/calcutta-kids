import {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper} from 'rules-config/rules';
import RuleHelper from '../RuleHelper';
import PregnancyHelper from '../PregnancyHelper';
import VaccinationFilters from './VaccinationFilters';
import lib from '../lib';

const filter = RuleFactory('5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99', 'ViewFilter');

@filter('9fb619f0-bf38-46fb-84db-b64f0574f5b0', 'Skip logic for ANCHomeVisit', 1, {})
class ANCHomeVisitFilterHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new ANCHomeVisitFilterHandler(), programEncounter, formElementGroup, today);
    }

    static afterTrimester(programEncounter, formElement, trimesterNumber) {
        const currentTrimester = PregnancyHelper.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().whenItem(currentTrimester).greaterThan(trimesterNumber);
        return statusBuilder.build();
    }

    otherHealthIssues(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Pregnancy complications', 'Other');
    }

    haveYouFeltAnyDecreasedFetalMovementOrNoFetalMovement(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
    }

    whenDidTheMovementStopOrDecrease(programEncounter, formElement) {
        const currentTrimester = PregnancyHelper.currentTrimester(programEncounter['programEnrolment'], programEncounter['encounterDateTime']);
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});

        if (currentTrimester < 2) {
            statusBuilder.show().whenItem(false).is.truthy;
        } else {
            statusBuilder.show().when.valueInEncounter('Foetal movements').containsAnyAnswerConceptName('Reduced', 'Absent');
        }
        return statusBuilder.build();
    }

    // Registration at institution
    whatIsTheNameOfTheInstitution(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Registered for institutional delivery', 'Yes');
    }

    encourageRegistrationAtInstitution(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Registered for institutional delivery', 'No');
    }

    otherServicesReceivedOutside(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Services received outside or at Calcutta Kids', 'Other');
    }

    // Eating less
    notEating(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, "Food eaten yesterday", "Nothing");
    }

    whyEatingSameOrLess(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Eating compared to your pre-pregnancy food intake', 'Less', 'Same');
    }

    otherReasonForEatingSameOrLess(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for eating less than pre-pregnancy', 'Other');
    }

    counselForEatingSameOrLess(programEncounter, formElement) {
        return this.whyEatingSameOrLess(programEncounter, formElement).or(this.notEating(programEncounter, formElement));
    }

    // Resting
    reasonForRestingLessThan2Hours(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter('Hours of rest yesterday').lessThan(2);
        return statusBuilder.build();
    }

    otherReasonForRestingLessThan2Hours(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for resting less than 2 hours', 'Other');
    }

    counsellingForRestingDuringPregnancy(programEncounter, formElement) {
        return this.reasonForRestingLessThan2Hours(programEncounter, formElement);
    }

    // Manual Labour
    reasonForSomeOrMoreManualLabour(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Manual labour being done compared to pre-pregnancy', 'Some', 'More');
    }

    otherReasonForManualLabour(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for same or more manual labour', 'Other');
    }

    counselAgainstManualLabourDuringPregnancy(programEncounter, formElement) {
        return this.reasonForSomeOrMoreManualLabour(programEncounter, formElement);
    }

    // Saving money
    reasonForNotSavingMoney(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Saving money for delivery', 'No');
    }

    howMuchMoneyHaveYouSavedSoFar(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Saving money for delivery', 'Yes');
    }

    otherReasonForNotSavingMoney(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsHas(programEncounter, formElement, 'Reason for not saving money', 'Other');
    }

    counselForSavingMoney(programEncounter, formElement) {
        return this.reasonForNotSavingMoney(programEncounter, formElement);
    }

    // Calcium tablets
    ancDiscussionItem2(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 1);
    }

    ancDiscussionItem3(programEncounter, formElement) {
        return ANCHomeVisitFilterHandler.afterTrimester(programEncounter, formElement, 2);
    }

    tt1Date(programEncounter, formElement) {
        return VaccinationFilters.filter(programEncounter, formElement);
    }

    tt2Date(programEncounter, formElement) {
        return VaccinationFilters.filter(programEncounter, formElement);
    }

    ttBoosterDate(programEncounter, formElement) {
        return VaccinationFilters.filter(programEncounter, formElement);
    }

    dateOfDeworming(programEncounter, formElement) {
        return VaccinationFilters.filter(programEncounter, formElement);
    }

    howManyCalciumTabletsHaveYouConsumedSinceYourLastVisit(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsNotHave(programEncounter, formElement, "Calcium tablets received from", "NA");
    }

    howManyFaTabletsHaveYouConsumedSinceYourLastVisit(programEncounter, formElement) {
        return RuleHelper.encounterCodedObsNotHave(programEncounter, formElement, "FA tablets received from", "NA");
    }

}

module.exports = {ANCHomeVisitFilterHandler};