import * as vscode from 'vscode';
import * as keywords from './keywords.json';

// Map section names from SIF to keywords.json keys
const sectionMap: { [key: string]: string } = {
    'header': 'header',
    'simulation': 'simulation',
    'constants': 'constants',
    'equation': 'equation',
    'solver': 'solver',
    'material': 'material',
    'body': 'body',
    'body force': 'bodyforce',
    'boundary condition': 'bc',
    'initial condition': 'ic',
    'component': 'component',
    'boundary': 'boundary'
};

// Common keywords that appear in all sections
const commonKeywords = new Set(['name', 'end']);

// Block header pattern
const blockHeaderPattern = /^\s*(Header|Simulation|Constants|Equation|Solver|Material|Body\s+Force|Body|Boundary\s+Condition|Initial\s+Condition|Component|Boundary)(\s+\d+)?\s*$/i;

// Keyword assignment pattern: captures the keyword part before = or (
const keywordPattern = /^\s*([A-Za-z][A-Za-z0-9\s\-\{\}]*?)(?:\s*\(|\s*=)/;

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('elmer');
    context.subscriptions.push(diagnosticCollection);

    // Validate on open and save
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(validateDocument),
        vscode.workspace.onDidSaveTextDocument(validateDocument),
        vscode.workspace.onDidChangeTextDocument(e => validateDocument(e.document))
    );

    // Validate all open documents
    vscode.workspace.textDocuments.forEach(validateDocument);
}

function validateDocument(document: vscode.TextDocument) {
    if (document.languageId !== 'elmer') {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    let currentSection: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('!')) {
            continue;
        }

        // Check for block headers
        const blockMatch = trimmedLine.match(blockHeaderPattern);
        if (blockMatch) {
            const sectionName = blockMatch[1].toLowerCase().replace(/\s+/g, ' ');
            currentSection = sectionMap[sectionName] || null;
            continue;
        }

        // Check for End
        if (/^\s*End\s*$/i.test(trimmedLine)) {
            currentSection = null;
            continue;
        }

        // Skip if no current section
        if (!currentSection) {
            continue;
        }

        // Check for keyword assignment
        const keywordMatch = line.match(keywordPattern);
        if (keywordMatch) {
            const rawKeyword = keywordMatch[1].trim();
            const normalizedKeyword = rawKeyword.toLowerCase().replace(/\s+/g, ' ');

            // Skip common keywords
            if (commonKeywords.has(normalizedKeyword)) {
                continue;
            }

            // Handle numbered keywords (e.g., "Mask Name 2" -> "Mask Name 1")
            const baseKeyword = normalizedKeyword.replace(/\s+\d+$/, ' 1');

            // Check if keyword is valid for this section
            const sectionKeywords = (keywords as any)[currentSection];
            if (sectionKeywords) {
                const isValid = sectionKeywords[normalizedKeyword] ||
                               sectionKeywords[baseKeyword] ||
                               isValidInAnySection(normalizedKeyword) ||
                               isValidInAnySection(baseKeyword);

                if (!isValid) {
                    // Find the position of the keyword in the line
                    const keywordStart = line.indexOf(rawKeyword);
                    const range = new vscode.Range(
                        new vscode.Position(i, keywordStart),
                        new vscode.Position(i, keywordStart + rawKeyword.length)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unknown keyword "${rawKeyword}" in ${currentSection.toUpperCase()} section`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.source = 'elmer';
                    diagnostics.push(diagnostic);
                }
            }
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

function isValidInAnySection(keyword: string): boolean {
    for (const section of Object.keys(keywords)) {
        if ((keywords as any)[section][keyword]) {
            return true;
        }
    }
    return false;
}

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
