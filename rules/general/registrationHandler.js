import {StatusBuilderAnnotationFactory, RuleFactory, FormElementStatusBuilder, FormElementsStatusHelper, FormElementStatus} from 'rules-config/rules';

const filters = RuleFactory("0ea3e070-39c5-48c8-ab9b-73e91c419d68", "ViewFilter");
const withStatusBuilder = StatusBuilderAnnotationFactory('individual', 'formElement');

const FiltersUuid = "73f1d6c5-10e8-4d6c-8658-b702b4cc1115";
@filters(FiltersUuid, "CK Registration ViewFilter", 1.0, {}, FiltersUuid)
class Filters {

    @withStatusBuilder
    addictionDetails([individual, formElement], statusBuilder) {
        statusBuilder.show().when.ageInYears.is.greaterThanOrEqualTo(5);
    }

    static exec(individual, formElementGroup, today) {
        return FormElementsStatusHelper.getFormElementsStatusesWithoutDefaults(new Filters(), individual, formElementGroup, today);
    }
}

module.exports[FiltersUuid] = Filters;
