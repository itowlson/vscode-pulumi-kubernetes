'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const subscriptions = [
        vscode.commands.registerCommand('extension.sayHello', () => {
            vscode.window.showInformationMessage('Hello World!');
        })
    ];

    context.subscriptions.push(...subscriptions);
}

export function deactivate() {
}