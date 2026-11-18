import { getBase64 } from "@/common/helper/getBase64";
import { InboxOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Upload, Image } from "antd";
import type { UploadProps } from "antd";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { useState } from "react";

export type UploadFileWithExtra = UploadFile & {
  isPrimary?: boolean;
};

type UploaderProps = Omit<UploadProps, "fileList" | "onChange"> & {
  value?: UploadFileWithExtra[];
  onChange?: (fileList: UploadFileWithExtra[]) => void;

  multiple?: boolean;
  enablePrimary?: boolean;
  primaryLabel?: string;
};

const Uploader = ({
  value = [],
  onChange,
  multiple = true,
  enablePrimary = false,
  primaryLabel = "Primary",
  ...props
}: UploaderProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = async (file: UploadFileWithExtra) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const setPrimary = (uid: string) => {
    if (!enablePrimary) return;

    const next = value.map((f) => ({
      ...f,
      isPrimary: f.uid === uid,
    }));

    onChange?.(next);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList }) => {
    let next = fileList as UploadFileWithExtra[];

    if (!multiple && next.length > 1) {
      next = [next[next.length - 1]];
    }

    onChange?.(next);
  };

  return (
    <>
      <Upload.Dragger
        {...props}
        multiple={multiple}
        listType="picture-card"
        fileList={value}
        onChange={handleChange}
        onPreview={handlePreview}
        beforeUpload={async (file: RcFile) => {
          (file as UploadFileWithExtra).thumbUrl = await getBase64(file);
          return false;
        }}
        itemRender={(originNode, file) => {
          const current = file as UploadFileWithExtra;

          return (
            <div className="relative group">
              {originNode}

              {enablePrimary && (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(current.uid);
                    }}
                    className="absolute top-1 right-1 z-50 bg-white rounded-full px-1 cursor-pointer shadow"
                  >
                    {current.isPrimary ? (
                      <StarFilled className="text-yellow-400!" />
                    ) : (
                      <StarOutlined className="text-gray-400!" />
                    )}
                  </div>

                  {current.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 z-40 text-xs text-center bg-yellow-400 text-white">
                      {primaryLabel}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files here</p>
      </Upload.Dragger>

      <Image
        style={{ display: "none" }}
        preview={{
          open: previewOpen,
          src: previewImage,
          onOpenChange: setPreviewOpen,
        }}
      />
    </>
  );
};

export default Uploader;
