# Elmer Language Support for VS Code

Syntax highlighting for [ElmerFEM](https://www.elmerfem.org/) Solver Input Files (`.sif`).

## Features

- Syntax highlighting for Elmer SIF files
- Code folding for block structures (Header, Simulation, Solver, etc.)
- Comment toggling with `!`
- Bracket matching

## Supported Syntax

- **Block keywords**: Header, Simulation, Constants, Equation, Solver, Material, Body, Body Force, Boundary Condition, Initial Condition, Component
- **Type keywords**: Real, Integer, Logical, String, Variable, File
- **Comments**: `! comment`
- **Numbers**: integers, floats, scientific notation (1e-06)
- **Strings**: "quoted text"
- **Booleans**: True, False
- **MATC expressions**: `$...$`
- **Solver methods**: MUMPS, CG, BiCGStab, GMRES, etc.

## Installation

### From VSIX

1. Download the `.vsix` file
2. In VS Code, press `Ctrl+Shift+P` and run "Extensions: Install from VSIX..."
3. Select the downloaded file

### From Source

1. Clone this repository
2. Run `npm install` (if you have Node.js)
3. Press `F5` to launch the Extension Development Host

## Usage

Open any `.sif` file and syntax highlighting will be applied automatically.

## Credits

- Syntax definitions adapted from [vim-elmer](https://github.com/tapegoji/vim-elmer)
- Extension structure based on [vscode-getdp](https://github.com/Bertbk/vscode-getdp)

## License

MIT
