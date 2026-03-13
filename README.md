# Piazza Resources Downloader+

`Piazza Resources Downloader+` is a Chrome extension that detects downloadable files on a Piazza **Resources** page, lets you select what you want, and downloads the selected files in a structured folder layout.

## Fork Information

- Fork repository: [yarden-carmi/Piazza-Resources-Downloader-Plus](https://github.com/yarden-carmi/Piazza-Resources-Downloader-Plus)
- Original project: [flora15/Piazza-Resources-Downloader](https://github.com/flora15/Piazza-Resources-Downloader)

## What This Extension Does

- Scans the current Piazza Resources page for downloadable resource links
- Groups files by section (with section-level and global select-all checkboxes)
- Lets you pick specific files before downloading
- Downloads files into nested folders:
  - `<Course Name>/<Section Title>/<File Name>`
- Sanitizes folder/file names to avoid invalid filesystem characters

## Demo

### Without the extension

![Manual download workflow](screen%20recordings/before.gif)

### With Piazza Resources Downloader+

![Extension download workflow](screen%20recordings/after.gif)

## Installation (Load Unpacked)

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder (`Piazza-Resources-Downloader-Plus`).

## How to Use

1. Open your Piazza course **Resources** page.
2. Click the extension icon.
3. Select individual files, entire sections, or use **Select all**.
4. Click **Download Selected**.

If you are not on a supported Piazza Resources page, the popup will prompt you to navigate there first.

## Permissions Used

- `downloads`: download selected resources
- `scripting`: inject content script into the active tab
- `https://piazza.com/*` host permission: access Piazza pages to detect resource links

## Project Structure

- `manifest.json` — extension manifest (MV3)
- `html/popup.html` — popup UI
- `css/popup.css` — popup styling
- `scripts/popup.js` — popup logic and download actions
- `scripts/send_links.js` — collects links from Piazza Resources page

## Acknowledgements

This project is a fork and continuation of the original work by [flora15](https://github.com/flora15).

## License

This repository is licensed under the terms in [LICENSE.md](LICENSE.md).



