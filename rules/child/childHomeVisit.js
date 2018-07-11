import {
    RuleFactory,
    FormElementStatusBuilder,
    FormElementsStatusHelper,
    StatusBuilderAnnotationFactory,
    complicationsBuilder as ComplicationsBuilder
} from 'rules-config/rules';

const HomeVisitFilter = RuleFactory("35aa9007-fe7a-4a59-b985-0a1c038df889", "ViewFilter");
const HomeVisitDecision = RuleFactory("35aa9007-fe7a-4a59-b985-0a1c038df889", "Decision");
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEncounter', 'formElement');

@HomeVisitDecision("f7b6f668-af02-4dff-8b0f-c74427262e37", "Child Home Visit Decision", 100.0, {})
class HomeVisitDecisions {
    static referral(programEncounter) {
        const complicationsBuilder = new ComplicationsBuilder({
            programEncounter: programEncounter,
            complicationsConcept: 'Refer to doctor for'
        });
        complicationsBuilder.addComplication("Insufficient urination")
            .when.ageInMonths.lessThanOrEqualTo(1).and
            .valueInEncounter("How many times has your child urinated in the last 24 hours?").lessThan(6);

        complicationsBuilder.addComplication("Insufficient urination")
            .when.ageInMonths.greaterThan(1).and
            .when.ageInMonths.lessThan(3).and
            .when.valueInEncounter("How many times has your child urinated in the last 24 hours?").lessThan(8);

        ["Lethargy", "Redness or discharge on the skin around the belly button", "Fever"]
            .forEach(complication =>
                complicationsBuilder.addComplication(complication)
                    .when
                    .valueInEncounter("Is your baby having any of the following problems?")
                    .containsAnswerConceptName(complication));

        complicationsBuilder.addComplication("Illness").when.valueInEncounter("Is your child sick right now?").is.yes
            .or
            .when.valueInEncounter("Refer child to").is.defined;
        return complicationsBuilder.getComplications();
    }

    static exec(programEncounter, decisions, context, today) {
        decisions.encounterDecisions.push(HomeVisitDecisions.referral(programEncounter));
        return decisions;
    }
}

@HomeVisitFilter("11a9fd8b-7234-4fc2-a9be-1895c6783778", "Child Home Visit Filter", 100.0, {})
class ChildHomeVisitFilter {
    haveYouFedYourChildAnyOfTheFollowing(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.lessThan(6);
        return statusBuilder.build();
    }

    whatElseDidFeedYourChild(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Have you fed your child any of the following?")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    @WithStatusBuilder
    ckCounsellToPromoteExclusiveBreastfeeding([], statusBuilder) {
        statusBuilder.show().when
            .valueInEncounter('Have you fed your child any of the following?').is.defined
            .and.valueInEncounter('Have you fed your child any of the following?').not.containsAnswerConceptName('No');
    }

    whyDidYouFeedYourBabySomethingOtherThanBreastMilk(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show()
            .when.ageInMonths.lessThan(6)
            .and.valueInEncounter('Have you fed your child any of the following?').is.defined
            .and.when.valueInEncounter("Have you fed your child any of the following?").not.containsAnswerConceptName("No");

        return statusBuilder.build();
    }

    anyOtherReasonWhyYouFedSomethingOtherThanBreastMilk(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Why did you feed your baby something other than breast milk?")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    areYouStillBreastFeedingYourChild(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.greaterThanOrEqualTo(6);
        return statusBuilder.build();
    }

    whatWasTheChildsAgeWhenYouStoppedBreastFeeding(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Are you still breast feeding your child?")
            .containsAnswerConceptName("No");
        return statusBuilder.build();
    }

    areYouFeedingYourChildAnyOtherLiquids(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.greaterThanOrEqualTo(6)
            .and.when.ageInMonths.lessThan(12);
        return statusBuilder.build();
    }

    haveYouFedYourChildAnyOfTheFollowingLiquids(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Are you feeding your child any other liquids?")
            .is.yes;
        return statusBuilder.build();
    }

    whatWasTheChildsAgeWhenYouStartedFeedingTheseLiquids(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Are you feeding your child any other liquids?")
            .is.yes;
        return statusBuilder.build();
    }

    haveYouBeenFeedingSolidsSemiSolidsToTheChild(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.greaterThanOrEqualTo(6)
            .and.when.ageInMonths.lessThan(12);
        return statusBuilder.build();
    }

    whatWasTheChildsAgeWhenYouStartedFeedingThemSolidsSemiSolids(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Have you been feeding solids/semi-solids to the child?").is.yes;
        return statusBuilder.build();
    }

    howManyTimesADayIsTheChildEatingHomemadeSemiSolidSolidFoods(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Have you been feeding solids/semi-solids to the child?").is.yes;
        return statusBuilder.build();
    }

    whatTypeOfSemiSolidSolidFoodsDoYouFeedYourChild(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Have you been feeding solids/semi-solids to the child?").is.yes;
        return statusBuilder.build();
    }

    howManyTimesADayIsTheChildEatingSnacks(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Have you been feeding solids/semi-solids to the child?").is.yes;
        return statusBuilder.build();
    }

    whatSnacksAreBeingFed(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("How many times a day is the child eating snacks?").is.defined
            .and.when.valueInEncounter("How many times a day is the child eating snacks?").not.containsAnswerConceptName("None");
        return statusBuilder.build();
    }

    whatOtherSnacksAreBeingFed(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("What snacks are being fed?")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }


    howManyTimesIsYourChildFedIn24Hours(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.lessThan(6);
        return statusBuilder.build();
    }

    howManyTimesHasYourChildUrinatedInTheLast24Hours(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.lessThan(6);
        return statusBuilder.build();
    }

    isYourBabyHavingAnyOfTheFollowingProblems(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.lessThan(6);
        return statusBuilder.build();
    }

    hasYourChildBeenSickInTheLast2Weeks(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().whenItem(true).is.truthy;
        return statusBuilder.build();
    }

    whatIllnessDidTheChildHave(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("Has your child been sick in the last 2 weeks?")
            .is.yes;
        return statusBuilder.build();
    }

    anyOtherIllness(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.valueInEncounter("What illness did the child have?")
            .containsAnswerConceptName("Other");
        return statusBuilder.build();
    }

    isYourChildSickRightNow(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().whenItem(true).is.truthy;
        return statusBuilder.build();
    }

    childPostNatalDiscussionTopicsLbw(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.is.lessThan(3);
        return statusBuilder.build();
    }

    childPostNatalDiscussionTopics(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.is.greaterThanOrEqualTo(3);
        return statusBuilder.build();
    }

    ckCounsellingForFeedingYourChildFrequently(programEncounter, formElement) {
        const statusBuilder = this._statusBuilder(programEncounter, formElement);
        statusBuilder.show().when.ageInMonths.is.lessThan(6)
            .and.valueInEncounter("How many times is your child fed in 24 hours?").lessThan(8);
        return statusBuilder.build();
    }

    _statusBuilder(programEncounter, formElement) {
        return new FormElementStatusBuilder({
            programEncounter: programEncounter,
            formElement: formElement
        });
    }

    static exec(programEncounter, formElementGroup, today) {
        return FormElementsStatusHelper.getFormElementsStatuses(new ChildHomeVisitFilter(), programEncounter, formElementGroup, today)
    }
}

module.exports = { ChildHomeVisitFilter, HomeVisitDecisions };