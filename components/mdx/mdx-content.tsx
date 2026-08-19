import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { isValidElement } from "react";
import { Mermaid } from "./mermaid";

type PreProps = ComponentPropsWithoutRef<"pre">;
type CodeProps = ComponentPropsWithoutRef<"code">;

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = (node as ReactElement<{ children?: unknown }>).props;
    return extractText(props.children);
  }
  return "";
}

/** ```mermaid fences render as diagrams; everything else stays a <pre>. */
function Pre(props: PreProps) {
  const child = props.children;
  if (isValidElement(child)) {
    const codeProps = (child as ReactElement<CodeProps>).props;
    if (typeof codeProps.className === "string" && codeProps.className.includes("language-mermaid")) {
      return <Mermaid chart={extractText(codeProps.children).trim()} />;
    }
  }
  return <pre {...props} />;
}

function Anchor(props: ComponentPropsWithoutRef<"a">) {
  const isExternal = typeof props.href === "string" && /^https?:/.test(props.href);
  return <a {...props} rel={isExternal ? "noopener noreferrer" : props.rel} />;
}

const components = { pre: Pre, a: Anchor };

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose">
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
