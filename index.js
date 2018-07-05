const {postAllRules} = require("rules-config/infra");

postAllRules("Calcutta Kids", "./rules/index.js", 'http://localhost:8021', '');
