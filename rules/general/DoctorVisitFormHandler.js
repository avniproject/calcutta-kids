const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, FormElementStatus} = require('rules-config/rules');
const filter = RuleFactory('b80646b2-b74e-415f-974c-f8f48d67b27e', 'ViewFilter');
const RuleHelper = require('../RuleHelper');

@filter('c2e2a3ee-bc06-45fa-adfb-b802f20e0030', 'Doctor Visit Form Handler', 100.0)
class DoctorVisitFormHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DoctorVisitFormHandler(), programEncounter, formElementGroup, today);
    }

    bmi(programEncounter, formElement, today) {
        const status = new FormElementStatus(formElement.uuid, true);
        let height = programEncounter.findObservation("Height", programEncounter);
        let weight = programEncounter.findObservation("Weight");
        return RuleHelper.createBMIFormElementStatus(height, weight, formElement);
    }
}

module.exports = { DoctorVisitFormHandler };