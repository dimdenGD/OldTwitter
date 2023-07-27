// Tests locale files

const fs = require('fs');
const path = require('path');

const validKey = /^[a-zA-Z0-9_@]+$/;
const placeholdersRegex = /\$[a-zA-Z0-9_@]+\$/g;
const validFieldKeys = ['name', 'message', 'description', 'example', 'note', 'placeholders'];

const locales = 
    fs.readdirSync(path.join(__dirname, '_locales'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

const englishLocale = JSON.parse(fs.readFileSync(path.join(__dirname, '_locales', 'en', 'messages.json')));
const englishLocaleArray = Object.keys(englishLocale);

let errors = false;

for(let localeName of locales) {
    let locale;

    try {
        locale = JSON.parse(fs.readFileSync(path.join(__dirname, '_locales', localeName, 'messages.json')));
    } catch(e) {
        console.error(`(Critical) Error parsing _locales/${localeName}/messages.json`, e);
        errors = true;
        continue;
    }

    if(localeName !== 'en') {
        let array = Object.keys(locale);
        let diff = englishLocaleArray.length - array.length;
        if(diff !== 0) {
            if(diff < 10) {
                let missing = englishLocaleArray.filter(key => !array.includes(key));
                console.log(`Missing ${diff} keys in _locales/${localeName}/messages.json: ${missing.join(', ')}`);
            } else {
                console.log(`Missing ${diff} keys in _locales/${localeName}/messages.json`);
            }
        } else {
            console.log(`All keys present in _locales/${localeName}/messages.json`);
        }
    }
    
    let keys = Object.keys(locale);
    for(let key of keys) {
        if(!englishLocale[key]) {
            console.error(`Key "${key}" is not present in English for _locales/${localeName}/messages.json`);
            errors = true;
        }
        if(!validKey.test(key)) {
            console.error(`Invalid key "${key}" in _locales/${localeName}/messages.json`);
            errors = true;
        }
        if(key.length > 80) {
            console.error(`Key "${key}" is too long in _locales/${localeName}/messages.json`);
            errors = true;
        }
    }

    if(!locale.ext_description) {
        console.error(`Missing "ext_description" in _locales/${localeName}/messages.json`);
        errors = true;
    }

    if(locale.ext_description.length > 132) {
        console.error(`"ext_description" is too long in _locales/${localeName}/messages.json`);
        errors = true;
    }

    for(let fieldName in locale) {
        let field = locale[fieldName];
        let keys = Object.keys(field);
        
        for(let key of keys) {
            if(!validFieldKeys.includes(key)) {
                console.error(`Invalid key "${key}" on "${fieldName}" in _locales/${localeName}/messages.json`);
                errors = true;
            }
        }

        if(typeof field.message !== 'string') {
            console.error(`Missing "message" on "${fieldName}" in _locales/${localeName}/messages.json`);
            errors = true;
        }

        let placeholders = field.message.match(placeholdersRegex);
        if(placeholders) {
            if(!field.placeholders) {
                console.error(`Missing "placeholders" on "${fieldName}" in _locales/${localeName}/messages.json`);
                errors = true;
            } else {
                placeholders = placeholders.map(placeholder => placeholder.slice(1, -1).toLowerCase());
                for(let placeholder of placeholders) {
                    if(!field.placeholders[placeholder]) {
                        console.error(`Missing placeholder "${placeholder}" on "${fieldName}" in _locales/${localeName}/messages.json`);
                        errors = true;
                    }
                    if(!field.placeholders[placeholder].content) {
                        console.error(`Missing placeholder content "${placeholder}" on "${fieldName}" in _locales/${localeName}/messages.json`);
                        errors = true;
                    }
                }
            }
        }
    }
}

if(errors) {
    process.exit(1);
} else {
    console.log('All locale files are valid.');
}