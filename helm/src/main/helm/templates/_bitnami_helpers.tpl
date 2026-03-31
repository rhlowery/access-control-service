{{/*
  Helper for Bitnami-style image resolution used by subcharts like Gravitino.
*/}}
{{- define "common.images.image" -}}
  {{- $registry := .imageRoot.registry -}}
  {{- $repository := .imageRoot.repository -}}
  {{- $tag := .imageRoot.tag | default .imageRoot.appVersion | default "latest" -}}
  {{- if $registry -}}
    {{- printf "%s/%s:%s" $registry $repository $tag -}}
  {{- else -}}
    {{- printf "%s:%s" $repository $tag -}}
  {{- end -}}
{{- end -}}

{{- define "common.images.pullSecrets" -}}
  {{- range .pullSecrets -}}
    - name: {{ . }}
  {{- end -}}
{{- end -}}
