# Contributing

You can propose a correction through an issue without editing HTML. Include a part number, the proposed change and evidence such as a manufacturer drawing or a clear photograph. Distinguish documented cross-references from visual similarity.

## Edit an entry

1. Find it in [the entry index](content/INDEX.md).
2. Edit `content/entries/entry-N.html` using GitHub's file editor or a local checkout. GitHub can create a branch and pull request for your edit.
3. Keep the row ID unchanged: associated-terminal and housing links depend on it.
4. Keep manufacturer numbers linked to their manufacturer pages. Distributor search links are separate; they do not prove availability.
5. Include supporting evidence in the pull request or issue.
6. Submit a pull request. GitHub Actions builds the site and validates entries and links automatically; no local web server is needed.

Housing rows have five cells. Terminal rows have six, with **Wire size (mm²)** before **Contact type**. Describe the contact system first and put ECU applications on a separate `ECU:` line. Contact gender describes the terminal used inside the housing.

## Add a part

Copy a similar row to an unused `entry-N.html` file. Set a unique row ID and add `<!--ENTRY:entry-N-->` to the appropriate table body in `templates/index.html`. Add a line to `content/INDEX.md` and include supporting evidence in the pull request.

Save new images under `static/assets/` using descriptive names. HTML paths are relative to the published root: `assets/example.png`. Do not embed base64 images or use paths from your own computer. Use photographs you can share and record their origin; identify generated or retouched illustrations in the pull request.

Preserve the existing logo styling, number formatting, image enlargement buttons and print association markers. Reuse a relevant row's structure. Open the site, search the part number, follow its associated-terminal links, enlarge the photo and inspect print preview.

## Review and publishing

Pull requests run the build and local-link validation. A maintainer reviews the technical evidence and layout before merging. The Pages workflow publishes changes merged into `main`; there is no direct anonymous editing of the live site.
