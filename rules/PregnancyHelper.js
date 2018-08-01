const {FormElementsStatusHelper} = require('rules-config/rules');
const TRIMESTER_MAPPING = new Map([[1, {from: 0, to: 12}], [2, {from: 13, to: 28}], [3, {from: 29, to: Infinity}]]);

class PregnancyHelper {
    static gestationalAge(enrolment, toDate) {
        return FormElementsStatusHelper.weeksBetween(toDate, enrolment.getObservationValue("Last menstrual period"));
    }

    static currentTrimester(enrolment, asOfDate) {
        return [...TRIMESTER_MAPPING.keys()]
            .find((trimester) =>
                this.gestationalAge(enrolment, asOfDate) <= TRIMESTER_MAPPING.get(trimester).to &&
                this.gestationalAge(enrolment, asOfDate) >= TRIMESTER_MAPPING.get(trimester).from);
    }
}

export default PregnancyHelper;