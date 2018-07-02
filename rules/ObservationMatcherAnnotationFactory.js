import RuleHelper from './RuleHelper';

const ObservationMatcherAnnotationFactory = function (scope, matchingFn) {
    const argToContextMapper = (args, argNames) => {
        const contextMap = {};
        argNames.forEach((argName, index) => {
            contextMap[argName] = args[index];
        });
        return contextMap;
    };

    return function ([...argNames]) {
        return function ObsMatcherAnnotation(conceptName, [...answerConceptNames]) {
            return function ObsMatcher(target, key, descriptor) {
                descriptor.value = function (...args) {
                    const context = argToContextMapper(args, argNames);
                    return RuleHelper.generalObservationMatcher(context, scope, conceptName, matchingFn, answerConceptNames);
                };
                return descriptor;
            };
        };
    };
};

module.exports = ObservationMatcherAnnotationFactory;