import { FormElementStatus } from 'rules-config/rules';
import lib from '../lib';

export default class VaccinationFilters {
    static filter(currentEncounter, formElement) {
        const value = lib.calculations.getOldestObsBeforeCurrentEncounter(currentEncounter, formElement.concept.name);
        return new FormElementStatus(formElement.uuid, true, value);
    }
}
