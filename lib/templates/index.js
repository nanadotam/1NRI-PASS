import { generateKairosPassTemplate } from './kairos-pass.js'

export const templateGenerators = {
  'kairos-pass': generateKairosPassTemplate
}

export const getTemplateGenerator = (templateName) => {
  const generator = templateGenerators[templateName]
  if (!generator) {
    throw new Error(`Template generator not found: ${templateName}`)
  }
  return generator
} 