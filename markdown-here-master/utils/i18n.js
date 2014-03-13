/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

/* jslint node: true */
"use strict";

var fs = require('fs');

var MOZ_RDF_FILENAME = '../src/install.rdf';
var MOZ_RDF_I18N_SECTION_START = '<!-- i18n -->';
var MOZ_RDF_I18N_SECTION_END = '<!-- /i18n -->';
var INSTALL_RDF_I18N_TEMPLATE =
'        <em:localized>\n' +
'          <Description>\n' +
'            <em:locale>{{locale}}</em:locale>\n' +
'            <em:name>{{app_name}}</em:name>\n' +
'            <em:description>{{app_slogan}}</em:description>\n' +
'          </Description>\n' +
'        </em:localized>\n';

resetInstallRdf();

var LOCALES_DIR = '../src/_locales/';

var locales = fs.readdirSync(LOCALES_DIR);

locales.forEach(function(locale) {
  // Skip .DS_Store. No locale dirs should start with '.'
  if (locale[0] === '.') {
    return;
  }

  processLocale(locale);
});


// Make sure that the necessary directories and entries are present.
function checkLocaleSanity(locale) {
  var mozLocaleDirectory = '../src/firefox/chrome/locale/' + locale;
  if (!fs.existsSync(mozLocaleDirectory)) {
    throw new Error('Mozilla locale directory missing: ' + locale);
  }

  var mozManifestFilename = '../src/chrome.manifest';
  var mozManifest = fs.readFileSync(mozManifestFilename, 'utf8');
  if (mozManifest.indexOf('locale') < 0) {
    throw new Error('Mozilla chrome.manifest missing locale entry: ' + locale);
  }
}


function resetInstallRdf() {
  // Blow away the generated part of install.rdf

  var oldRdf = fs.readFileSync(MOZ_RDF_FILENAME, 'utf8');

  // '[^]*' is a trick to match across lines -- '.*' won't work.
  var regex = new RegExp(MOZ_RDF_I18N_SECTION_START + '[^]*' + MOZ_RDF_I18N_SECTION_END);
  var newRdf = oldRdf.replace(regex, MOZ_RDF_I18N_SECTION_START + '\n' + MOZ_RDF_I18N_SECTION_END);

  if (oldRdf === newRdf) {
    console.log('WARNING: empty or missing i18n setion in install.rdf');
  }

  fs.writeFileSync(MOZ_RDF_FILENAME, newRdf);
}


function addEntryToInstallRdf(rdfEntry) {
  var oldRdf = fs.readFileSync(MOZ_RDF_FILENAME, 'utf8');

  var newRdf = oldRdf.replace(MOZ_RDF_I18N_SECTION_END, rdfEntry + '\n' + MOZ_RDF_I18N_SECTION_END);

  fs.writeFileSync(MOZ_RDF_FILENAME, newRdf);
}


function processLocale(locale) {
  checkLocaleSanity(locale);

  // message.json is authoritative. The Firefox files are derived from it.
  var stringBundle = JSON.parse(fs.readFileSync(LOCALES_DIR + locale + '/messages.json'));

  var mozPropertiesFilename = '../src/firefox/chrome/locale/' + locale + '/strings.properties';
  fs.truncateSync(mozPropertiesFilename, 0);

  var mozDtdFilename = '../src/firefox/chrome/locale/' + locale + '/strings.dtd';
  fs.truncateSync(mozDtdFilename, 0);

  // We'll iterate through the keys in sorted order, to help keep the diffs stable.
  var keys, i, key, message;
  keys = Object.keys(stringBundle).sort();
  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    message = stringBundle[key]['message'];

    // Chrome i18n strings use dollar signs as placeholders, so $$ is actually a
    // single literal dollar sign.
    // TODO: Support placeholders cross-platform.
    message = message.replace(/\$\$/g, '$');

    message = message.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');

    fs.appendFileSync(mozPropertiesFilename, key + '=' + message + '\n');

    if (stringBundle[key]['inMozDTD']) {
      fs.appendFileSync(mozDtdFilename, '<!ENTITY ' + key + ' "' + message + '">\n' );
    }
  }

  var rdfEntry = INSTALL_RDF_I18N_TEMPLATE
                  .replace('{{locale}}', locale)
                  .replace('{{app_name}}', stringBundle['app_name'].message)
                  .replace('{{app_slogan}}', stringBundle['app_slogan'].message);

  addEntryToInstallRdf(rdfEntry);
}

