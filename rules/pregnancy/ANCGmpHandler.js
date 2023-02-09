import {
    RuleFactory,
    FormElementsStatusHelper,
    StatusBuilderAnnotationFactory,
    complicationsBuilder as ComplicationsBuilder
} from 'rules-config/rules';
const _ = require('lodash');
import lib from '../lib';

const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

const isAbnormalWeightGain = (programEncounter) => {
    const {
        programEnrolment,
        encounterDateTime
    } = programEncounter;
    return !lib.calculations.isNormalWeightGain(programEnrolment, programEncounter, encounterDateTime);
};

const isBelowNormalWeightGain = (programEncounter) => {
    const {
        programEnrolment,
        encounterDateTime
    } = programEncounter;
    return lib.calculations.isBelowNormalWeightGain(programEnrolment, programEncounter, encounterDateTime);
};

const calculateBMI = (programEncounter) => {

    const latestHeightObs = programEncounter.programEnrolment.findLatestObservationInEntireEnrolment('Height', programEncounter);
    const currentWeightObs = programEncounter.findObservation("Weight");

    const latestHeight = latestHeightObs && latestHeightObs.getReadableValue();
    const currentWeight = currentWeightObs && currentWeightObs.getReadableValue();

    return typeof (latestHeight) == undefined ?
        null :
        lib.C.calculateBMI(currentWeight, latestHeight);
};

const pregnancyGMPDecision = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", "Decision");
const viewFilters = RuleFactory("4632c1f5-59cd-4e65-899c-beb2c87a3bff", 'ViewFilter');

@pregnancyGMPDecision("47b05f6b-dac4-456f-8878-7ccef7cf365e", "ANC GMP decisions [CK]", 100.0, {})
class GMPDecision {
    static bmiDecision(programEncounter) {
        const bmi = calculateBMI(programEncounter);
        return _.isNil(bmi) ? {} : {
            name: 'BMI',
            value: bmi
        };
    }

    static highRisks(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'High Risk Conditions'
        });

        complicationsBuilder.addComplication("Irregular weight gain")
            .when.valueInEncounter("Weight").lessThanOrEqualTo(35);

        complicationsBuilder.addComplication("Irregular weight gain")
            .whenItem(isAbnormalWeightGain(programEncounter)).is.truthy;

        complicationsBuilder.addComplication('Intrauterine Growth Retardation')
            .whenItem(isBelowNormalWeightGain(programEncounter)).is.truthy;

        return complicationsBuilder.getComplications();
    }

    static referral(programEncounter) {
        const {
            programEnrolment,
            encounterDateTime
        } = programEncounter;
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to the hospital for'
        });

        complicationsBuilder.addComplication("Irregular weight gain")
            .whenItem(isAbnormalWeightGain(programEncounter)).is.truthy;

        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(GMPDecision.bmiDecision(programEncounter));
        decisions.encounterDecisions.push(GMPDecision.highRisks(programEncounter));
        decisions.encounterDecisions.push(GMPDecision.referral(programEncounter));
        return decisions;
    }
}

const FiltersUuid = 'adf2d64b-4c2d-4706-96c6-946d6a49cd87';

@viewFilters(FiltersUuid, 'ANC GMP Visit Filter rules', 100, {}, FiltersUuid)
class Filters {

    @WithStatusBuilder
    ckCompleteDietAdvice([encounter], statusBuilder) {
        statusBuilder.show().whenItem(isBelowNormalWeightGain(encounter)).is.truthy;
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper
            .getFormElementsStatusesWithoutDefaults(new Filters(), programEncounter, formElementGroup, today);
    }
}

module.exports = {
    GMPDecision
};
module.exports[FiltersUuid] = Filters;