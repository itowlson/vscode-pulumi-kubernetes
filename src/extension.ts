'use strict';

import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

import { kubefsUri } from './kubernetes/kubernetes.virtualfs';
import { toTypeScript } from './pulumi/pulumiser';
import { failed } from './utils/errorable';

export function activate(context: vscode.ExtensionContext) {

    const subscriptions = [
        vscode.commands.registerCommand('pulumi.k8s.pulumise', pulumise)
    ];

    context.subscriptions.push(...subscriptions);
}

export function deactivate() {
}

async function pulumise(target: any) {
    if (!target || !target.resourceId) {
        vscode.window.showErrorMessage("Expected VS Code Kubernetes object");
        return;
    }
    // TODO: on the k8s extension side: explorer nodes should expose their k8svfs URLs so we can bypass this
    const resourceId: string = target.resourceId;
    const uri = kubefsUri(null, resourceId, 'yaml');
    const resourceDoc = await vscode.workspace.openTextDocument(uri);
    const resourceYAML = resourceDoc.getText();
    const resourceObj = yaml.safeLoad(resourceYAML);

    const pulumiTS = toTypeScript(resourceObj);
    if (failed(pulumiTS)) {
        vscode.window.showErrorMessage(pulumiTS.error[0]);
        return;
    }

    const folder = vscode.workspace.rootPath!;  // TODO: properly
    const file = path.join(folder, resourceObj.metadata.name + ".ts");

    fs.writeFileSync(file, pulumiTS.result);

    const pulumiDoc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(pulumiDoc);
}
