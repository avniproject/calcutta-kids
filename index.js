const {postAllRules} = require("rules-config/infra");
const _ = require('lodash');
const serverurl = _.isEmpty(process.argv[2]) ? 'http://localhost:8021': process.argv[2];
const token = _.isEmpty(process.argv[3]) ? 'DUMMY': process.argv[3];
postAllRules("Calcutta Kids", "./rules/index.js", serverurl, token);
