/* eslint-disable react-refresh/only-export-components */
import {
  Button,
  Form,
  Input,
  Space,
  Switch,
  message,
  InputNumber,
  DatePicker,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import dayjs from "dayjs";

import Loading from "@/components/Loading";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";

import {
  useCreateFlashSaleMutation,
  useGetFlashSaleByIdQuery,
  useUpdateFlashSaleMutation,
} from "@/common/api/flash-sale.api";
import { useUploadSingleAssetMutation } from "@/common/api/asset.api";
import { getAssetUrl } from "@/common/utils/assets";

type FlashSaleFormValues = {
  name: string;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
  banner_image?: UploadFileWithExtra[];
  priority?: number;
  is_active?: boolean;
};

const FlashSaleFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm<FlashSaleFormValues>();
  const navigate = useNavigate();

  const { data: flashSale, isLoading } = useGetFlashSaleByIdQuery(Number(id), {
    skip: !isEdit,
  });

  const [createFlashSale, { isLoading: isCreating }] =
    useCreateFlashSaleMutation();
  const [updateFlashSale, { isLoading: isUpdating }] =
    useUpdateFlashSaleMutation();

  const [uploadSingleAsset] = useUploadSingleAssetMutation();

  useEffect(() => {
    if (isEdit && flashSale) {
      form.setFieldsValue({
        name: flashSale.name,
        start_time: dayjs(flashSale.start_time),
        end_time: dayjs(flashSale.end_time),
        priority: flashSale.priority,
        is_active: flashSale.is_active,
        banner_image: flashSale.banner_image
          ? [
              {
                uid: "banner",
                name: flashSale.banner_image.split("/").pop(),
                status: "done",
                url: getAssetUrl(flashSale.banner_image),
              },
            ]
          : [],
      });
    }
  }, [isEdit, flashSale, form]);

  const onFinish = async (values: FlashSaleFormValues) => {
    try {
      let banner_image: string | undefined;
      const file = values.banner_image?.[0];

      if (file?.originFileObj) {
        const res = await uploadSingleAsset({
          file: file.originFileObj,
          type: "flash-sales",
        }).unwrap();
        banner_image = res.url;
      } else if (file?.url) {
        banner_image = file.url;
      }

      const body = {
        name: values.name,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        banner_image,
        priority: values.priority,
      };

      if (isEdit) {
        await updateFlashSale({
          id: Number(id),
          body: {
            ...body,
            is_active: values.is_active,
          },
        }).unwrap();
      } else {
        await createFlashSale(body).unwrap();
      }

      message.success(
        isEdit
          ? "Updated flash sale successfully"
          : "Created flash sale successfully",
      );
      navigate("/flash-sales");
    } catch (error) {
      console.error(error);
      message.error("Submit failed");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        priority: 0,
        is_active: true,
      }}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Flash Sale" : "Create Flash Sale"}
      </h2>

      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input flash sale name" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Start Time"
        name="start_time"
        rules={[{ required: true, message: "Please select start time" }]}
      >
        <DatePicker showTime className="w-full" />
      </Form.Item>

      <Form.Item
        label="End Time"
        name="end_time"
        rules={[{ required: true, message: "Please select end time" }]}
      >
        <DatePicker showTime className="w-full" />
      </Form.Item>

      <Form.Item label="Priority" name="priority">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      {isEdit && (
        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}

      <Form.Item
        label="Banner Image"
        name="banner_image"
        rules={[
          {
            validator(_, value: UploadFileWithExtra[]) {
              if (!value || value.length === 0) {
                return Promise.reject("Please upload banner image");
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Uploader maxCount={1} />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4">
          <Button onClick={() => navigate("/flash-sales")}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FlashSaleFormPage;
