import PregnancyHelper from "../PregnancyHelper";

const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;

const ancHomeVisitDecisions = RuleFactory("5565a4d1-ef0e-4ff5-bce5-fc4f7d94ce99", "Decision");

@ancHomeVisitDecisions("87ca4ff2-2d57-44e7-b741-eba7401399a8", "ANC Home Visit Decisions", 100.0, {})
class ANCHomeVisitDecisions {
    static referral(programEncounter) {
        const referralBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Referral'
        });

        let currentTrimester = PregnancyHelper.currentTrimester(programEncounter.programEnrolment, programEncounter.encounterDateTime);
        let group2 = ["Convulsions without fever", "PV leaking", "Per vaginal bleeding", "Excessive vomiting and inability to consume anything orally in last 24 hours"];
        if (currentTrimester === 1) {
            referralBuilder.addComplication("Refer to Calcutta Kids doctor").when.valueInEncounter("Pregnancy complications").is.defined.and.valueInEncounter("Pregnancy complications").not.containsAnyAnswerConceptName(...group2);
            referralBuilder.addComplication("Refer to hospital").when.valueInEncounter("Pregnancy complications").containsAnyAnswerConceptName(...group2);
        } else if (currentTrimester >= 2) {
            referralBuilder.addComplication("Refer to Calcutta Kids doctor").when.valueInEncounter("Pregnancy complications").is.defined;
            referralBuilder.addComplication("Inform CK program manager").when.valueInEncounter("Pregnancy complications").containsAnyAnswerConceptName(...group2);
        }
        return referralBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(ANCHomeVisitDecisions.referral(programEncounter));
        return decisions;
    }
}

module.exports = { ANCHomeVisitDecisions };