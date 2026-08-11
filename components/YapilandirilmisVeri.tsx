export function YapilandirilmisVeri({ veri }: { veri: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, "\\u003c") }}
    />
  );
}
