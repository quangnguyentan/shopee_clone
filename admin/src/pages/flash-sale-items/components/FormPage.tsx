import {
  Button,
  Form,
  Space,
  InputNumber,
  Select,
  Switch,
  message,
  Skeleton,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import Loading from "@/components/Loading";

import {
  useAddFlashSaleItemMutation,
  useGetFlashSaleByIdQuery,
} from "@/common/api/flash-sale.api";
import type { AddFlashSaleItemDto } from "@/common/types/flash-sale-items.type";
import { useGetAllProductVariantsQuery } from "@/common/api/product-variant.api";

type FlashSaleItemFormValues = {
  product_variant_id: number;
  flash_price: number;
  stock: number;
  is_active: boolean;
};

const FlashSaleItemFormPage = () => {
  const { flashSaleId } = useParams<{ flashSaleId: string }>();
  console.log(flashSaleId, "flashSaleId");
  const navigate = useNavigate();
  const [form] = Form.useForm<FlashSaleItemFormValues>();

  const { data: flashSale, isLoading } = useGetFlashSaleByIdQuery(
    Number(flashSaleId),
    { skip: !flashSaleId },
  );

  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);

  const variantMapRef = useRef<Map<number, A>>(new Map());
  const [variantList, setVariantList] = useState<A[]>([]);

  const {
    data: variants,
    isFetching: isVariantsFetching,
    isLoading: isVariantLoading,
  } = useGetAllProductVariantsQuery({ page, limit });

  useEffect(() => {
    if (!variants?.items) return;

    variants.items.forEach((v) => {
      variantMapRef.current.set(v.id, v);
    });

    setVariantList(Array.from(variantMapRef.current.values()));

    if (variants.items.length < limit) {
      setHasMore(false);
    }
  }, [variants, limit]);

  const [addFlashSaleItem, { isLoading: isSubmitting }] =
    useAddFlashSaleItemMutation();

  const variantOptions = variantList.map((v) => {
    const attrText =
      v.attributes?.length > 0
        ? v.attributes
            .map((a: A) =>
              a.value?.value
                ? `${a.attribute.name}: ${a.value.value}`
                : a.custom_value
                  ? `${a.attribute.name}: ${a.custom_value}`
                  : a.attribute.name,
            )
            .join(" - ")
        : "Default";

    return {
      value: Number(v.id),
      searchLabel: `${v.product?.name} ${v.sku} ${attrText}`,
      label: (
        <div className="flex flex-col">
          <span className="font-medium">{v.product?.name}</span>
          <span className="text-xs text-gray-500">{attrText}</span>
          <span className="text-xs text-gray-400">
            SKU: {v.sku} • ₫{Number(v.price).toLocaleString()} • Stock:{" "}
            {v.stock}
          </span>
        </div>
      ),
    };
  });
  const onFinish = async (values: FlashSaleItemFormValues) => {
    try {
      const body: AddFlashSaleItemDto = {
        product_variant_id: values.product_variant_id,
        flash_price: values.flash_price,
        stock: values.stock,
      };

      await addFlashSaleItem({
        flashSaleId: Number(flashSaleId),
        body,
      }).unwrap();

      message.success("Added flash sale item successfully");
      navigate(`/flash-sales/${flashSaleId}/items`);
    } catch (error) {
      console.error(error);
      message.error("Submit failed");
    }
  };

  if (isLoading || isVariantLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ is_active: true, stock: 0 }}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        Add Item to Flash Sale:{" "}
        <span className="font-normal">{flashSale?.name}</span>
      </h2>

      <Form.Item
        label="Product Variant"
        name="product_variant_id"
        rules={[{ required: true, message: "Please select product variant" }]}
      >
        <Select
          showSearch
          placeholder="Select product variant"
          options={variantOptions}
          optionFilterProp="searchLabel"
          loading={isVariantsFetching && page === 1}
          filterOption={(input, option) =>
            option?.searchLabel?.toLowerCase().includes(input.toLowerCase()) ??
            false
          }
          onPopupScroll={(e) => {
            const target = e.target as HTMLDivElement;
            const isBottom =
              target.scrollTop + target.offsetHeight >= target.scrollHeight - 5;

            if (isBottom && hasMore && !isVariantsFetching) {
              setPage((prev) => prev + 1);
            }
          }}
          dropdownRender={(menu) => (
            <>
              {menu}

              {isVariantsFetching && page > 1 && (
                <div className="px-3 py-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton
                      key={i}
                      active
                      title={false}
                      paragraph={{ rows: 2 }}
                      className="mb-2"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        />
      </Form.Item>

      <Form.Item
        label="Flash Price"
        name="flash_price"
        rules={[{ required: true, message: "Please input flash price" }]}
      >
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item
        label="Stock"
        name="stock"
        rules={[{ required: true, message: "Please input stock" }]}
      >
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Active" name="is_active" valuePropName="checked">
        <Switch disabled />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Add Item
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FlashSaleItemFormPage;
