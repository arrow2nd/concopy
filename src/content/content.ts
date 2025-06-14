// Use direct browser API instead of polyfill for content script
declare const browser: {
  runtime: {
    onMessage: {
      addListener: (callback: (request: { action: string }) => Promise<PageContext> | PageContext) => void;
    };
  };
};

interface PageContext {
  title: string;
  url: string;
  selection: string;
  content: string;
  meta: Record<string, string>;
}

function extractPageContext(): PageContext {
  const selection = window.getSelection()?.toString() || "";

  const metaTags: Record<string, string> = {};
  document.querySelectorAll("meta[name], meta[property]").forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    const content = meta.getAttribute("content");
    if (name && content) {
      metaTags[name] = content;
    }
  });

  return {
    title: document.title,
    url: window.location.href,
    selection,
    content: document.body.innerText || "",
    meta: {
      description: metaTags["description"] || metaTags["og:description"],
      keywords: metaTags["keywords"],
      author: metaTags["author"] || metaTags["article:author"],
      ...metaTags,
    },
  };
}

browser.runtime.onMessage.addListener((request) => {
  if (request.action === "getPageContext") {
    return Promise.resolve(extractPageContext());
  }
});

