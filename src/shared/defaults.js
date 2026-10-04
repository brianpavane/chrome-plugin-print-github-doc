// Default settings, shared by the options page and the content scripts.
// Assigned to globalThis (not const) because content scripts are re-injected
// on every click.

globalThis.GHP_DEFAULTS = {
  showPanel: true, // show the options panel before printing
  includeHeader: true, // title, repository, file, URL at the top
  printLinkUrls: false, // "text (https://…)" after links
  expandDetails: true, // open collapsed <details> sections
  sectionPageBreaks: false, // start each top-level section on a new page
};
