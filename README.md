# Free conference room schedule sign maker

A one-page, one-room manual sign maker from Schedule Press. Enter the event, room, date, and up to six sessions; inspect the page; then use the browser's print dialog to print or save a PDF. Entries are processed in the tab and are not uploaded or saved.

The full [Schedule Press](https://5611130604166.gumroad.com/l/schedule-press-sessionize-room-signs) kit makes room-by-room, day-by-day print packs from organizer-created Sessionize Schedule Grid JSON. This free maker uses manual entry and does not accept a public Sessionize timetable page.

[Pocket Agenda Studio](https://5611130604166.gumroad.com/l/pocket-agenda-studio) is a separate $4.90 offline CSV-to-foldable-agenda kit for attendees. The site links to both products from the relevant print workflow. The [free pocket agenda guide](printable-pocket-conference-agenda.html) includes a fictional CSV example, a real one-page PDF sample, and a fold-and-print checklist.

The site also includes a [Sessionize room-door sign workflow](sessionize-room-signs.html): endpoint setup, data checks, proofing and a printer checklist. It cites Sessionize's official API guidance and links back to the free maker. Product links from the free site use Gumroad UTM parameters so future clicks and purchases can be attributed to this site; no site analytics script is installed.

The [free CSV name badge maker](badge-maker.html) imports up to 250 people and makes four 3 × 4 inch cut-out inserts per A4 or US Letter sheet. It accepts `name` or separate first/last name columns, with optional organization and role. It handles UTF-8 comma, semicolon, or tab-delimited files in the browser. `badge-example.csv` and the browser-generated `badge-sample-A4.pdf` use fictional attendees. The badges are plain-paper inserts, not calibrated for perforated label stock. The [PDF sample](badge-sample-A4.pdf) is one A4 page with four badges.

The [free workshop certificate maker](workshop-certificate-maker.html) creates one attendance or appreciation certificate at a time. It previews A4 or US Letter landscape output, fits ordinary long names where possible, and blocks printing if content does not fit. It does not verify credentials, use a logo or signature, or upload names. The fictional [A4](certificate-sample-A4.pdf) and [US Letter](certificate-sample-letter.pdf) samples each render as one page. This page is a small distribution test for workshop and event searches; a bulk CSV version has not been built or offered for sale.

## Use

Open `index.html` in a current desktop Chromium browser or visit the GitHub Pages site. Choose **Try sample** to inspect an example. Fill in your own event data, review the print preview, then select **Print or save PDF**. Match A4 or US Letter paper, use 100% scale and no margins, disable browser headers and footers, and inspect the final print preview. This is an independent tool and is not affiliated with Sessionize.

## Hosting

This is a static HTML/CSS/JavaScript site. No build step, analytics, external fonts, or schedule-upload endpoint. GitHub Pages can publish from the root of the default branch. `.nojekyll` keeps the static files unchanged.

`googleb80246301bd759a0.html` is the Google Search Console ownership file for this URL-prefix property. Keep it at the published site root to retain verification. The one-page `sitemap.xml` can be submitted in Search Console. Search Console measures Google search impressions and clicks; it does not measure all site visits or purchases.

## QA

The synthetic six-session A4 and US Letter samples each printed as one PDF page in Aside/Chromium on 2026-10-24. Both PDFs were rendered and inspected for clipping. Printing an empty form with Ctrl+P produced an instruction page instead of a placeholder sign. Other browsers and physical printers have not been verified. Test one sheet with your printer before a full run.

The published `sample-room-sign-a4.pdf` and `sample-room-sign-us-letter.pdf` are those browser-generated one-page QA PDFs. Their content is fictional. The app's validation logic changed after these PDFs were generated; their rendering is representative of the current print layout, not a fresh PDF export from the final build.

The badge maker's four-name A4 sample printed as one PDF page and an eight-name US Letter sample printed as two PDF pages in Aside/Chromium on 2026-10-25. Both page sizes and rendered output were inspected. Physical trimming and badge-holder fit remain for a real printer test.

## License

The source for this free tool is MIT licensed. The separately sold Schedule Press kit is not part of this repository.
