const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, FormElementStatus} = require('rules-config/rules');
const filter = RuleFactory('b80646b2-b74e-415f-974c-f8f48d67b27e', 'ViewFilter');
const RuleHelper = require('../RuleHelper');

@filter('c2e2a3ee-bc06-45fa-adfb-b802f20e0030', 'Doctor Visit Form Handler', 100.0)
class DoctorVisitFormHandler {
    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new DoctorVisitFormHandler(), programEncounter, formElementGroup, today);
    }

    bmi(programEncounter, formElement) {
        let height = programEncounter.findObservation("Height", programEncounter);
        let weight = programEncounter.findObservation("Weight");
        return RuleHelper.createBMIFormElementStatus(height, weight, formElement);
    }

    pregnancyTest = (programEncounter, formElement) => {
        return this._showOnlyForMother(formElement, programEncounter);
    };

    _showOnlyForMother(formElement, programEncounter) {
        return new FormElementStatus(formElement.uuid, programEncounter.programEnrolment.program.name === 'CK Mother');
    }

    healthProblemClassification(programEncounter, formElement) {
        let formElementStatusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        if (programEncounter.programEnrolment.program.name === 'Child') {
            formElementStatusBuilder.skipAnswers('Pregnancy', 'Childbirth / Puerperium');
        }
        return formElementStatusBuilder.build();
    }

    otherHealthProblemClassification(programEncounter, formElement) {
        let statusBuilder = new FormElementStatusBuilder({programEncounter, formElement});
        statusBuilder.show().when.valueInEncounter("Health problem / Classification").containsAnswerConceptName('Other');
        return statusBuilder.build();
    }

    gravida(programEncounter, formElement) {
        return this._showOnlyForMother(formElement, programEncounter);
    }

    para(programEncounter, formElement) {
        return this._showOnlyForMother(formElement, programEncounter);
    }

    abortions(programEncounter, formElement) {
        return this._showOnlyForMother(formElement, programEncounter);
    }

    living(programEncounter, formElement) {
        return this._showOnlyForMother(formElement, programEncounter);
    }
}

module.exports = {DoctorVisitFormHandler};