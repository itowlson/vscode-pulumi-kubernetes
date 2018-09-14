import { Uri } from "vscode";

// TODO: We should get this from the k8s extension but
// we don't have an API for it yet, so...

export const K8S_RESOURCE_SCHEME = "k8smsx";
export const KUBECTL_RESOURCE_AUTHORITY = "loadkubernetescore";
export const HELM_RESOURCE_AUTHORITY = "helmget";

export function kubefsUri(namespace: string | null, value: string, outputFormat: string): Uri {
    const docname = `${value.replace('/', '-')}.${outputFormat}`;
    const nonce = new Date().getTime();
    const nsquery = namespace ? `ns=${namespace}&` : '';
    const uri = `${K8S_RESOURCE_SCHEME}://${KUBECTL_RESOURCE_AUTHORITY}/${docname}?${nsquery}value=${value}&_=${nonce}`;
    return Uri.parse(uri);
}
