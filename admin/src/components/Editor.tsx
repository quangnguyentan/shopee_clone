import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Quill, { Delta } from "quill";
import "quill/dist/quill.snow.css";

export type QuillEditorRef = {
  getHTML: () => string;
  setHTML: (html: string) => void;
};

type Props = {
  readOnly?: boolean;
  onChange?: (html: string) => void;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Editor = forwardRef<QuillEditorRef, Props>(
  ({ readOnly = false, onChange }, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);
    const blobUrlsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
      if (!editorRef.current || !toolbarRef.current || quillRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        readOnly,
        modules: {
          toolbar: {
            container: toolbarRef.current,
            handlers: {
              image: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.click();

                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;

                  const base64 = await fileToBase64(file);

                  const range = quill.getSelection(true) ?? {
                    index: quill.getLength(),
                    length: 0,
                  };

                  quill.insertEmbed(range.index, "image", base64);
                  quill.setSelection(range.index + 1);
                };
              },
            },
          },
        },
      });

      quill.clipboard.addMatcher("img", (node) => {
        const src = (node as HTMLImageElement).src;
        if (src?.startsWith("data:")) {
          return new Delta();
        }
        return new Delta().insert({ image: src });
      });

      const handleTextChange = () => {
        onChange?.(quill.root.innerHTML);
      };
      quill.on("text-change", handleTextChange);

      quillRef.current = quill;
    }, []);
    useEffect(() => {
      return () => {
        blobUrlsRef.current.forEach((url) => {
          URL.revokeObjectURL(url);
        });
        blobUrlsRef.current.clear();
      };
    }, []);
    useImperativeHandle(ref, () => ({
      getHTML: () => quillRef.current?.root.innerHTML || "",
      setHTML: (html) => {
        quillRef.current?.clipboard.dangerouslyPasteHTML(html);
      },
    }));

    return (
      <div className="quill-wrapper">
        <div ref={toolbarRef}>
          <select className="ql-header">
            <option value="2" />
            <option value="3" />
            <option selected />
          </select>
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <select className="ql-align">
            <option selected />
            <option value="center" />
            <option value="right" />
            <option value="justify" />
          </select>
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-clean" />
        </div>

        <div ref={editorRef} />
      </div>
    );
  },
);

export default Editor;
