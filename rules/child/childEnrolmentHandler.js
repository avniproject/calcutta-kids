const {RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, complicationsBuilder} = require('rules-config/rules');
const ComplicationsBuilder = complicationsBuilder;
const childEnrolmentDecision = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "Decision");
import _ from 'lodash';


@childEnrolmentDecision("a4edfca4-a2de-40f6-8d02-8b5ef8a2d37e", "Child Enrolment decisions [CK]", 100.0, {})
class ChildEnrolmentDecisions {
    static highRisk(programEnrolment) {
        const highRiskBuilder = new ComplicationsBuilder({
            programEnrolment: programEnrolment,
            complicationsConcept: 'High Risk Conditions'
        });

        highRiskBuilder.addComplication("Child born Underweight")
            .when.valueInEnrolment("Birth Weight").is.lessThan(2.6);
        return highRiskBuilder.getComplications();
    }

    static exec(programEnrolment, decisions, context, today) {
        decisions.enrolmentDecisions.push(ChildEnrolmentDecisions.highRisk(programEnrolment));
        return decisions;
    }
}

const EnrolmentChecklists = RuleFactory("1608c2c0-0334-41a6-aab0-5c61ea1eb069", "Checklists");

@EnrolmentChecklists("203e1c1f-4718-4c4d-9906-f3f14821118b", "CK Child Vaccination checklists", 100.0)
class ChildChecklists {
    static exec(enrolment, checklists = [], checklistDetails) {
        checklists = checklists.filter(c => c.detail.uuid !== '28442845-242b-46de-964f-e9e4c9311975');//remove core module vaccination
        let vaccinationDetails = checklistDetails.find(cd => cd.name === 'Vaccination' && cd.uuid === '8feb5a65-ad3d-4a1f-91d1-44a561995b09');
        if (vaccinationDetails === undefined) return checklists;
        const vaccinationList = {
            baseDate: enrolment.individual.dateOfBirth,
            detail: {uuid: vaccinationDetails.uuid},
            items: vaccinationDetails.items.map(vi => ({
                detail: {uuid: vi.uuid}
            }))
        };
        let isEdit = _.some(checklists, list => list.detail.uuid === vaccinationDetails.uuid);
        return isEdit ? checklists : [vaccinationList];
    }
}


module.exports = {ChildEnrolmentDecisions, ChildChecklists};