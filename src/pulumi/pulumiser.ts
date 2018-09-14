import { Errorable } from "../utils/errorable";

export function toTypeScript(resourceObj: any): Errorable<string> {
    const pmodule = classPrefix(resourceObj);
    if (!pmodule) {
        return { succeeded: false, error: [`Don't yet know how to pulumise ${resourceObj.kind} objects`] };
    }

    const pcontent = contentScript(resourceObj);

    const lines = ['import * as k8s from "@pulumi/kubernetes";', ''];

    lines.push(`const ${safeName(resourceObj.metadata.name)} = new ${pmodule}.${resourceObj.kind}("${resourceObj.metadata.name}", {`);
    lines.push(...pcontent);
    lines.push(`});`);

    lines.push('', ...JSON.stringify(resourceObj, undefined, 2).split('\n').map((l) => `// ${l.trimRight()}`));

    return { succeeded: true, result: lines.join('\r\n') };  // TODO: platform independent
}

function safeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

function classPrefix(kobj: any): string | undefined {
    switch (kobj.kind) {
        case "ConfigMap":
        case "Secret":
        case "Service":
        case "Pod":
            return "k8s.core.v1";
        case "Deployment":
            return "k8s.apps.v1";
        case "Job":
            return "k8s.batch.v1";
        default:
            return undefined;
    }
}

function contentScript(kobj: any): string[] {
    switch (kobj.kind) {
        case "ConfigMap": return configMapContent(kobj);
        case "Secret": return secretContent(kobj);
        case "Service": return serviceContent(kobj);
        case "Pod": return podContent(kobj);
        case "Deployment": return deploymentContent(kobj);
        case "Job": return jobContent(kobj);
        default: return [];
    }
}

function configMapContent(o: any): string[] {
    const pobj = { data: o.data };
    return jsOf(pobj);
}

function deploymentContent(o: any): string[] {
    const pobj = { spec: o.spec };
    delete pobj.spec.template.metadata;
    return jsOf(pobj);
}

// TODO: haven't been able to test this yet - probably needs
// at least the same tweak as Deployment
function jobContent(o: any): string[] {
    const pobj = { spec: o.spec };
    return jsOf(pobj);
}

function podContent(o: any): string[] {
    const pobj = { spec: o.spec };
    return jsOf(pobj);
}

function secretContent(o: any): string[] {
    const pobj = { data: o.data, stringData: o.stringData, type: o.type };
    return jsOf(pobj);
}

function serviceContent(o: any): string[] {
    const pobj = { spec: o.spec };
    return jsOf(pobj);
}

function jsOf(o: any): string[] {
    const json = JSON.stringify(o, undefined, 2);
    const lines = json.split('\n').map(dequote).map((l) => l.trimRight());
    return lines.slice(1, lines.length - 1);
}

// This makes for more idiomatic TypeScript but is technically unnecessary,
// and breaks if a property contains non-token characters (e.g. a cert key
// such as ca.crt).  TODO: SOME THINKING
function dequote(s: string): string {
    const sepIndex = s.indexOf(':');
    if (sepIndex < 0) {
        return s;
    }
    const keybit = s.substring(0, sepIndex);
    const tskeybit = keybit.replace(/\"/g, '');
    return s.replace(keybit, tskeybit);

}
