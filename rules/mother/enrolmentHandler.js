import { RuleFactory } from 'rules-config/rules';
import _ from 'lodash';
import lib from '../lib';

const validation = RuleFactory('c5b2eb03-7ed3-4fbc-95b7-07412219368f', 'Validation');

@validation("ec2ef406-f835-4502-ad4f-001d931783e0", "Mother Enrolment Validation Failure [CK]", 100.0)
class MotherEnrolmentValidationFailureCk {
    validate(programEnrolment) {
        const validationResults = [];
        if (_.isEmpty(programEnrolment.individual.children)) {
            validationResults.push(lib.C.createValidationError('individualWithoutChildrenCannotBeEnrolledInMotherProgram'));
        }
        return validationResults;
    }
    static exec(programEnrolment, validationErrors) {
        return new MotherEnrolmentValidationFailureCk().validate(programEnrolment);
    }
}

module.exports = { MotherEnrolmentValidationFailureCk };
