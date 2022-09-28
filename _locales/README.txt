Hello! I would be very thankful if you help me to translate this extension.

There's couple of folders here, each corresponding to language code.
If you want to translate, copy "en" folder (English) and paste with renaming it to your language's 2-letter country code.
Here's list of codes: https://www.loc.gov/standards/iso639-2/php/code_list.php. Seek for second row, ISO 639-1. If it's empty there, then sorry, you can't translate to this language.
Then open newly pasted folder and open messages.json in it. You'll now see { "message": "some text" } parts in it. You can start translating text part!
Things to keep in mind:
- Some lines have "description" or "example" fields, it's comments for translators. You don't have to translate them.
- !! Pay attention to texts case and symbols in it! If English version has something in lowercase, use lowercase in translation too.
- Keep $SOMETHING_HERE$ parts unchanged.
- "\n" text means new line symbol.
- Place \ before " inside your text.
- Try to keep everything as short as English version, if possible (unless it's big messages)

When you're finished you can send me your messages.json file to these places:
- email: admin@dimden.dev
- twitter: https://twitter.com/dimdenEFF
- discord: https://discord.gg/k4u7ddk
- github issues: https://github.com/dimdenGD/OldTwitter/issues

Thank you!