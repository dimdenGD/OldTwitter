## Localization / Translation

Hello! I would be very thankful if you help me to translate this extension.

### Getting Started

There's couple of folders here, each corresponding to language code.

If you want to translate, copy ``en`` folder (English) and paste with renaming it to your language's 2-letter country code.

[Here's list of codes](https://www.loc.gov/standards/iso639-2/php/code_list.php). Seek for second row (ISO 639-1). If it's empty there, then sorry, you can't translate to this language.

Then open newly pasted folder and open ``messages.json`` in it. You'll now see ``{ "message": "some text" }`` parts in it. Then you can start translating by editing ``some text`` part!

### Translation Guidelines

**Things to keep in mind:**
- Some lines have ``description``, ``example`` or ``placeholder`` fields, they are comments for translators or placeholders. You don't have to translate them.  
- Pay attention to texts case and symbols in it! If English version has something in lowercase, use lowercase in translation too.
- Keep ``$SOMETHING_HERE$`` parts unchanged.
- Place ``\`` before ``"`` inside your text.
- Try to keep everything as short as English version, if possible (unless it's big messages).
- Some translations are ``replacer``s used in code to batch replace certain strings. Read the description before editing it!

### Translation Support Tools

We provide a helpful tool in the `./_locales` directory to assist with translations:

#### Locale Diff Tool (./locales-support.html)
This tool helps you:
- Compare your translation with the English base version side by side
- Identify missing translations
- Convert text to proper JSON format for messages.json
- Support dark/light mode for comfortable editing
- Visualize differences between translations

### Contributing Your Translation

When you're finished you can send me your ``messages.json file``:
- create a pull request on GitHub (preferred)
- create [GitHub issue](https://github.com/dimdenGD/OldTwitter/issues) with your file attached

You can also include your Twitter profile to get credited.

Thank you!