#!/usr/bin/env node

/**
 * Script to automatically fix React imports in all TypeScript/TSX files
 * Removes unnecessary "import React" statements for React 19 compatibility
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const srcDir = join(process.cwd(), 'src');
const files = globSync('**/*.{ts,tsx}', { cwd: srcDir });

let fixedCount = 0;
let errorCount = 0;

console.log('🔍 Scanning for React import issues...\n');

files.forEach((file) => {
  const filePath = join(srcDir, file);
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Pattern 1: import React, { ... } from 'react';
    // Replace with: import { ... } from 'react';
    content = content.replace(
      /import\s+React,\s*\{([^}]+)\}\s*from\s*['"]react['"]/g,
      'import {$1} from \'react\''
    );
    
    // Pattern 2: import React from 'react';
    // Remove if no JSX.Element or React.FC usage
    if (!/React\.(FC|ReactNode|ReactElement|Component|createElement)/.test(content)) {
      content = content.replace(
        /import\s+React\s+from\s*['"]react['"];?\n?/g,
        ''
      );
    }
    
    // Pattern 3: import * as React from 'react';
    // Replace with named imports if possible
    if (!/React\.(FC|ReactNode|ReactElement|Component|createElement)/.test(content)) {
      content = content.replace(
        /import\s+\*\s+as\s+React\s+from\s*['"]react['"];?\n?/g,
        ''
      );
    }
    
    // Add type keyword for type-only imports
    content = content.replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]react['"]/g,
      (match, imports) => {
        // Check if all imports are types
        const importList = imports.split(',').map(i => i.trim());
        const typeImports = importList.filter(i => 
          i.startsWith('type ') || 
          ['ReactNode', 'ReactElement', 'FC', 'ComponentType'].some(t => i.includes(t))
        );
        
        if (typeImports.length === importList.length && typeImports.length > 0) {
          return `import type {${imports}} from 'react'`;
        }
        
        return match;
      }
    );
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`   📁 Total scanned: ${files.length} files`);

if (fixedCount > 0) {
  console.log('\n✨ React imports have been updated for React 19 compatibility!');
  console.log('   Run your linter to verify the changes.');
}