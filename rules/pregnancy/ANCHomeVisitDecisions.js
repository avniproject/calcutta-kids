import PregnancyHelper from "../PregnancyHelper";
import {RuleFactory, complicationsBuilder as ComplicationsBuilder} from 'rules-config/rules';

const ancHomeVisitDecisions = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "Decision");
const getCurrentTrimester = ({programEnrolment, encounterDateTime}) => PregnancyHelper.currentTrimester(programEnrolment, encounterDateTime);
const group1Complications = [
    'Severe headache',
    'Severe Abdominal Pain',
    'Painful or difficult urination',
    'Pain on urination',
    'Morning Sickness',
    'Moderate ankle, body or face swelling',
    'Fever',
    'Excess fatigue',
    'Dizziness',
    'Difficulty breathing',
    'Decreased Foetal movements',
    'Blurred vision'
];
const group2Complications = ['Convulsions without fever', 'PV leaking', 'Per vaginal bleeding', 'Excessive vomiting and inability to consume anything orally in last 24 hours'];

@ancHomeVisitDecisions("87ca4ff2-2d57-44e7-b741-eba7401399a8", "ANC Home Visit Decisions", 100.0, {})
class ANCHomeVisitDecisions {
    static referToCKDoctor(programEncounter, {currentTrimester}) {
        const referralBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: "Refer to Calcutta Kids doctor"
        });

        group1Complications.forEach(compilation =>
            referralBuilder.addComplication(compilation)
                .whenItem(currentTrimester).is.equals(1)
                .and.valueInEncounter('Pregnancy complications').containsAnswerConceptName(compilation));

        group1Complications.concat(group2Complications).forEach(compilation =>
            referralBuilder.addComplication(compilation)
                .whenItem(currentTrimester).is.greaterThanOrEqualTo(2)
                .and.valueInEncounter('Pregnancy complications').containsAnswerConceptName(compilation));
        return referralBuilder.getComplications();
    }

    static referToHospital(programEncounter, {currentTrimester}) {
        const referralBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: "Refer to the hospital for"
        });

        group2Complications.forEach(compilation =>
            referralBuilder.addComplication(compilation)
                .whenItem(currentTrimester).is.equals(1)
                .and.valueInEncounter('Pregnancy complications').containsAnswerConceptName(compilation));
        return referralBuilder.getComplications();
    }

    static infromCKProgramManager(programEncounter, {currentTrimester}) {
        const referralBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: "Inform CK program manager"
        });

        group2Complications.forEach(compilation =>
            referralBuilder.addComplication(compilation)
                .whenItem(currentTrimester).is.greaterThanOrEqualTo(2)
                .and.valueInEncounter('Pregnancy complications').containsAnswerConceptName(compilation));
        return referralBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        const preFilled = {currentTrimester: getCurrentTrimester(programEncounter)};
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.referToCKDoctor(programEncounter, preFilled));
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.referToHospital(programEncounter, preFilled));
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.infromCKProgramManager(programEncounter, preFilled));
        return decisions;
    }
}

module.exports = {ANCHomeVisitDecisions};