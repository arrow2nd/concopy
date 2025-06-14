import { PageContext, FunctionResult, CopyFunction } from './types'
import { library } from './library'

// Template rendering function
export function render(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(&?)(\w+)\}\}/g, (match, escape, key) => {
    const value = data[key] ?? ''
    return escape ? String(value) : library.escapeHtml(String(value))
  })
}

// Available template functions that users can choose from
export const templateFunctions = {
  'rich-text-link': {
    name: 'Rich Text Link',
    description: 'Create a rich text link with title and URL',
    code: `(page) => {
  return {
    html: render('<a href="{{&url}}">{{title}}</a>', page),
    text: page.title,
  };
}`,
    execute: (page: PageContext) => ({
      html: render('<a href="{{&url}}">{{title}}</a>', page),
      text: page.title,
    })
  },
  
  'markdown-link': {
    name: 'Markdown Link',
    description: 'Create a markdown-formatted link',
    code: `(page) => {
  return {
    text: \`[\${page.title}](\${page.url})\`,
  };
}`,
    execute: (page: PageContext) => ({
      text: `[${page.title}](${page.url})`,
    })
  },
  
  'title-and-url': {
    name: 'Title and URL',
    description: 'Copy page title and URL separately',
    code: `(page) => {
  return {
    text: page.title + "\\n" + page.url,
  };
}`,
    execute: (page: PageContext) => ({
      text: page.title + '\n' + page.url,
    })
  },
  
  'custom-template': {
    name: 'Custom Template',
    description: 'Use a custom template with page data',
    code: `(page) => {
  // Custom template - edit this
  const template = "{{title}} - {{url}}";
  return {
    text: render(template, page),
  };
}`,
    execute: (page: PageContext, customTemplate?: string) => {
      const template = customTemplate || '{{title}} - {{url}}'
      return {
        text: render(template, page),
      }
    }
  },
  
  'selected-text': {
    name: 'Selected Text',
    description: 'Copy selected text or page title if nothing selected',
    code: `(page) => {
  return {
    text: page.selection || page.title,
  };
}`,
    execute: (page: PageContext) => ({
      text: page.selection || page.title,
    })
  },
  
  'page-summary': {
    name: 'Page Summary',
    description: 'Create a summary with title, URL, and description',
    code: `(page) => {
  const summary = [
    "Title: " + page.title,
    "URL: " + page.url,
  ];
  
  if (page.meta?.description) {
    summary.push("Description: " + page.meta.description);
  }
  
  return {
    text: summary.join("\\n"),
  };
}`,
    execute: (page: PageContext) => {
      const summary = [
        'Title: ' + page.title,
        'URL: ' + page.url,
      ]
      
      if (page.meta?.description) {
        summary.push('Description: ' + page.meta.description)
      }
      
      return {
        text: summary.join('\n'),
      }
    }
  }
}

// Function to safely execute a template-based function
export function executeTemplateFunction(
  functionId: string, 
  page: PageContext, 
  customOptions?: Record<string, unknown>
): FunctionResult {
  const templateFunc = templateFunctions[functionId as keyof typeof templateFunctions]
  
  if (!templateFunc) {
    throw new Error(`Unknown template function: ${functionId}`)
  }
  
  try {
    return templateFunc.execute(page, customOptions)
  } catch (error) {
    console.error('Template function execution error:', error)
    throw error
  }
}

// Parse and execute user-provided functions (safe parsing only)
export function parseUserFunction(code: string): {
  templateId: string
  customOptions?: Record<string, unknown>
} {
  // For now, try to match common patterns to template functions
  if (code.includes('render(') && code.includes('<a href=')) {
    return { templateId: 'rich-text-link' }
  }
  
  if (code.includes('[') && code.includes('](')) {
    return { templateId: 'markdown-link' }
  }
  
  if (code.includes('page.selection')) {
    return { templateId: 'selected-text' }
  }
  
  if (code.includes('page.title') && code.includes('page.url')) {
    return { templateId: 'title-and-url' }
  }
  
  // Default to custom template
  return { 
    templateId: 'custom-template',
    customOptions: extractTemplateFromCode(code)
  }
}

// Extract template pattern from user code
function extractTemplateFromCode(code: string): string | undefined {
  // Try to extract template strings from the code
  const templateMatch = code.match(/render\(['"`]([^'"`]+)['"`]/)
  if (templateMatch) {
    return templateMatch[1]
  }
  
  // Try to extract simple string concatenation patterns
  const concatMatch = code.match(/page\.title\s*\+\s*['"`]([^'"`]+)['"`]\s*\+\s*page\.url/)
  if (concatMatch) {
    return `{{title}}${concatMatch[1]}{{url}}`
  }
  
  return undefined
}

// Main executor function
export async function executeCopyFunction(
  func: CopyFunction,
  context: PageContext
): Promise<FunctionResult> {
  try {
    // If function has a templateId, use it directly
    if (func.templateId) {
      return executeTemplateFunction(func.templateId, context, func.customOptions)
    }
    
    // Otherwise, try to parse the user function and map to a template
    const parsed = parseUserFunction(func.code)
    return executeTemplateFunction(parsed.templateId, context, parsed.customOptions)
    
  } catch (error) {
    console.error('Function execution error:', error)
    throw new Error(`Failed to execute function: ${error instanceof Error ? error.message : String(error)}`)
  }
}