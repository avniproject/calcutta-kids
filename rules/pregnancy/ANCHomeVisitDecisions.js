const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

const childBirthDecisions = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "Decision");

@childBirthDecisions("89734dbf-0339-4f6b-a1d0-8484b4018519", "ANC Home Visit Decisions", 100.0, {})
class ANCHomeVisitDecisions {
    static ckReferral(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Referral'
        });
        complicationsBuilder.addComplication("Please inform CK Program Manager and  refer to CK  doctor/ hospital")
            .when.valueInEncounter("Pregnancy complications").containsAnyAnswerConceptName("Convulsions without fever", "Leak of amniotic fluid", "Per vaginal bleeding", "Excessive vomiting and inability to consume anything orally");
        complicationsBuilder.addComplication("Please refer to the CK doctor")
            .when.valueInEncounter("Pregnancy complications").containsAnyAnswerConceptName("Convulsions without fever", "Leak of amniotic fluid", "Per vaginal bleeding", "Excessive vomiting and inability to consume anything orally");

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.ckReferral(programEncounter));
        return decisions;
    }
}

module.exports = {BirthFormRules, BirthDecisions};