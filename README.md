# Free conference room schedule sign maker

A one-page, one-room manual sign maker from Schedule Press. Enter the event, room, date, and up to six sessions; inspect the page; then use the browser's print dialog to print or save a PDF. Entries are processed in the tab and are not uploaded or saved.

The full [Schedule Press](https://5611130604166.gumroad.com/l/schedule-press-sessionize-room-signs) kit makes room-by-room, day-by-day print packs from organizer-created Sessionize Schedule Grid JSON. This free maker uses manual entry and does not accept a public Sessionize timetable page.

## Use

Open `index.html` in a current desktop Chromium browser or visit the GitHub Pages site. Choose **Try sample** to inspect an example. Fill in your own event data, review the print preview, then select **Print or save PDF**. Match A4 or US Letter paper, use 100% scale and no margins, disable browser headers and footers, and inspect the final print preview. This is an independent tool and is not affiliated with Sessionize.

## Hosting

This is a static HTML/CSS/JavaScript site. No build step, analytics, external fonts, or schedule-upload endpoint. GitHub Pages can publish from the root of the default branch. `.nojekyll` keeps the static files unchanged.

## QA

The synthetic six-session A4 and US Letter samples each printed as one PDF page in Aside/Chromium on 2026-10-24. The A4 PDF was rendered and inspected for clipping. Printing an empty form with Ctrl+P produced an instruction page instead of a placeholder sign. Other browsers and physical printers have not been verified. Test one sheet with your printer before a full run.

## License

The source for this free tool is MIT licensed. The separately sold Schedule Press kit is not part of this repository.
