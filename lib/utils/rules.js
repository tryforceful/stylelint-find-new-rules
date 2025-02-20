'use strict';

const coreRules = require('stylelint').rules;
const extractRuleMeta = require('./extractRuleMeta');

const getAllRules = (config) => {
    const rules = Object.entries(coreRules).map(([name, rule]) => (
        extractRuleMeta(name, rule, false)
    ));

    if (config.plugins) {
        [config.plugins].flat().forEach((plugin) => {
            let pluginRules;
            pluginRules = require(plugin); // eslint-disable-line import/no-dynamic-require, global-require
            pluginRules = pluginRules.default || pluginRules; // - ES6 or CommonJS modules
            pluginRules = [pluginRules].flat();

            pluginRules.forEach(({ ruleName: name, rule }) => {
                if (!name || !name.includes('/')) {
                    return;
                }
                rules.push(extractRuleMeta(name, rule, true));
            });
        });
    }

    return rules;
};

const getUsedRules = (config, allRules = null) => {
    if (allRules === null) {
        allRules = getAllRules(config);
    }

    const rules = Object.keys(config.rules || {})
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((name) => {
            const rule = allRules.find((_rule) => _rule.name === name);
            return rule || { name, url: null };
        });

    return rules;
};

module.exports = { getUsedRules, getAllRules };
