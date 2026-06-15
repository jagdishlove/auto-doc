import { parse } from '@babel/parser';
import { AstAnalysisResult } from '../types';

/**
 * Perform deep AST analysis using @babel/parser.
 * Supports JS, TS, and modern syntax features.
 */
export const performAstAnalysis = async (code: string, language: string): Promise<AstAnalysisResult> => {
  return new Promise((resolve) => {
    // Wrap in timeout to prevent UI freezing on large files
    setTimeout(() => {
      try {
        const result = analyzeCode(code);
        resolve(result);
      } catch (e) {
        console.error("AST Parse failed, falling back to regex", e);
        // Fallback to regex if AST fails (e.g. strict mode syntax errors in partial files)
        resolve(fallbackRegexAnalysis(code));
      }
    }, 100);
  });
};

const analyzeCode = (code: string): AstAnalysisResult => {
  const functions: string[] = [];
  const classes: string[] = [];
  const imports: string[] = [];
  const routesFound: { method: string; path: string }[] = [];

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy', 'exportDefaultFrom'],
    errorRecovery: true
  });

  // Simple recursive walker
  const visit = (node: any) => {
    if (!node) return;

    // 1. Detect Functions
    if (node.type === 'FunctionDeclaration' && node.id?.name) {
      functions.push(node.id.name);
    } 
    else if (node.type === 'VariableDeclarator' && 
             (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')) {
      if (node.id?.name) functions.push(node.id.name);
    }

    // 2. Detect Classes
    if (node.type === 'ClassDeclaration' && node.id?.name) {
      classes.push(node.id.name);
    }

    // 3. Detect Imports
    if (node.type === 'ImportDeclaration') {
      imports.push(node.source.value);
    } else if (node.type === 'CallExpression' && node.callee?.name === 'require' && node.arguments?.[0]?.value) {
      imports.push(node.arguments[0].value);
    }

    // 4. Detect Express/Router API calls (The "Gold" for this app)
    // Looks for: app.get('/path'), router.post('/path'), etc.
    if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
      const propName = node.callee.property?.name; // get, post, put...
      const objName = node.callee.object?.name;     // app, router...

      const httpMethods = ['get', 'post', 'put', 'delete', 'patch'];
      
      if (httpMethods.includes(propName) && node.arguments?.length > 0) {
        // First argument is usually the path string
        const firstArg = node.arguments[0];
        if (firstArg.type === 'StringLiteral') {
           routesFound.push({
             method: propName.toUpperCase(),
             path: firstArg.value
           });
        }
      }
    }

    // Recurse into children
    for (const key in node) {
      if (typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => visit(child));
        } else if (node[key].type) {
          visit(node[key]);
        }
      }
    }
  };

  visit(ast.program);

  return { functions, classes, imports, routesFound };
};

const fallbackRegexAnalysis = (code: string): AstAnalysisResult => {
  const functions: string[] = [];
  const classes: string[] = [];
  const imports: string[] = [];
  const routesFound: { method: string; path: string }[] = [];

  const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*[\(]|static\s+async\s+(\w+))/g;
  const classRegex = /(?:class\s+(\w+))/g;
  const importRegex = /(?:import\s+.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\))/g;

  // Regex for routes: .get('/path', ...
  const routeRegex = /\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;

  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[1] || match[2] || match[3]);
  }
  while ((match = classRegex.exec(code)) !== null) {
    classes.push(match[1]);
  }
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1] || match[2]);
  }
  while ((match = routeRegex.exec(code)) !== null) {
    routesFound.push({ method: match[1].toUpperCase(), path: match[2] });
  }

  return { functions, classes, imports, routesFound };
};

/**
 * Lightweight scanner to check if a file is worth sending to the LLM.
 */
export const detectApiPatterns = (code: string): boolean => {
  const apiIndicators = [
    // Express / JS
    /\.get\s*\(/,
    /\.post\s*\(/,
    /\.put\s*\(/,
    /\.delete\s*\(/,
    /\.patch\s*\(/,
    /express\.Router\(\)/,
    /app\.use\(/,
    
    // Python / Flask / FastAPI
    /@app\.route/,
    /@router\.get/,
    /@router\.post/,
    
    // Spring/Generic
    /Mapping\s*\(/, 
  ];

  return apiIndicators.some(pattern => pattern.test(code));
};