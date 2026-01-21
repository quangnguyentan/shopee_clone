import { Button, Form, Input, Select, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";
import { useGetShopByIdQuery } from "@/common/api/shop.api";
import type { Shop } from "@/common/types/shop.type";
import { getAssetUrl } from "@/common/utils/assets";

type ShopFormValues = Omit<Shop, "logo"> & {
  logo?: UploadFileWithExtra[];
};

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm<ShopFormValues>();
  const navigate = useNavigate();

  const { data: shop, isLoading } = useGetShopByIdQuery(
    { id },
    { skip: !isEdit },
  );

  const extractAssetPath = (url?: string) => {
    if (!url) return undefined;
    const assetBase = import.meta.env.VITE_ASSET_URL;
    return url.startsWith(assetBase) ? url.replace(assetBase, "") : url;
  };

  useEffect(() => {
    if (isEdit && shop?.logo) {
      form.setFieldsValue({
        ...shop,
        logo: [
          {
            uid: "logo",
            name: shop.logo.split("/").pop(),
            status: "done",
            url: getAssetUrl(shop.logo),
          },
        ],
      });
    }
  }, [isEdit, shop]);

  const onFinish = (values: ShopFormValues) => {
    const file = values.logo?.[0];

    const logo = file?.url ? extractAssetPath(file.url) : file?.originFileObj;

    const payload = {
      ...values,
      logo,
    };

    console.log(payload);
  };
  if (isLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input className="h-10" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true }]}
      >
        <Input className="h-10" />
      </Form.Item>

      <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item
        label="Price min"
        name="price_min"
        rules={[{ required: true }]}
      >
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item
        label="Price max"
        name="price_max"
        rules={[{ required: true }]}
      >
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item label="Status" name="status" rules={[{ required: true }]}>
        <Select
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Shop Logo"
        name="logo"
        valuePropName="value"
        rules={[
          {
            validator(_, value: UploadFileWithExtra[]) {
              if (!value || value.length === 0) {
                return Promise.reject("Please upload shop logo");
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Uploader multiple={false} />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4 items-center">
          <Button onClick={() => navigate("/products")}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
